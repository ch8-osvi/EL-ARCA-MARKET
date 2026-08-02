import mongoose from "mongoose";
import { connectDB, runInTransaction } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";
import { InventoryMovement, MovementType } from "@/models/InventoryMovement";
import { Purchase } from "@/models/Purchase";
import { AuditLog } from "@/models/AuditLog";
import { multiplyMoney, sumMoney } from "@/lib/money";

export interface AdjustStockInput {
  organizationId: string;
  storeId?: string;
  productId: string;
  type: MovementType;
  quantity: number; // Positivo para añadir, negativo para reducir
  reason: string;
  notes?: string;
  userId: string;
}

export async function adjustStock(input: AdjustStockInput) {
  await connectDB();

  return await runInTransaction(async (session) => {
    const product = await Product.findById(input.productId).session(session);
    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    const previousStock = product.stock;
    const newStock = previousStock + input.quantity;

    if (newStock < 0 && !product.allowNegativeStock && product.controlType !== "service") {
      throw new Error(`El ajuste dejaría el stock en negativo (${newStock}). Operación no permitida.`);
    }

    product.stock = newStock;
    await product.save({ session });

    const totalCost = multiplyMoney(product.cost, Math.abs(input.quantity));

    const [movement] = await InventoryMovement.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          productId: product._id,
          type: input.type,
          quantity: input.quantity,
          previousStock,
          newStock,
          unitCost: product.cost,
          totalCost,
          reason: input.reason,
          notes: input.notes,
          createdBy: input.userId,
        },
      ],
      { session }
    );

    await AuditLog.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          userId: input.userId,
          action: "stock_adjusted",
          entity: "Product",
          entityId: product._id,
          details: {
            sku: product.sku,
            type: input.type,
            quantity: input.quantity,
            previousStock,
            newStock,
            reason: input.reason,
          },
        },
      ],
      { session }
    );

    return { product, movement };
  });
}

export interface ReceivePurchaseInput {
  organizationId: string;
  storeId?: string;
  supplierId: string;
  referenceNumber: string;
  purchaseDate?: Date;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
    lotNumber?: string;
    expirationDate?: Date;
  }[];
  notes?: string;
  idempotencyKey?: string;
  userId: string;
}

export async function receivePurchase(input: ReceivePurchaseInput) {
  await connectDB();

  if (input.idempotencyKey) {
    const existing = await Purchase.findOne({ idempotencyKey: input.idempotencyKey });
    if (existing) return existing;
  }

  return await runInTransaction(async (session) => {
    const purchaseItems = [];
    let subtotalAcc = 0;

    for (const item of input.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Producto no encontrado ID: ${item.productId}`);
      }

      const itemTotalCost = multiplyMoney(item.unitCost, item.quantity);
      subtotalAcc = sumMoney([subtotalAcc, itemTotalCost]);

      // Estrategia de costo promedio ponderado para productos simples
      const oldStock = product.stock;
      const oldCost = product.cost;
      const newStock = oldStock + item.quantity;

      let weightedCost = item.unitCost;
      if (newStock > 0) {
        const totalOldValue = multiplyMoney(oldCost, Math.max(0, oldStock));
        const totalNewValue = sumMoney([totalOldValue, itemTotalCost]);
        weightedCost = Math.round((totalNewValue / newStock) * 100) / 100;
      }

      product.cost = weightedCost;
      product.stock = newStock;
      await product.save({ session });

      purchaseItems.push({
        productId: product._id as mongoose.Types.ObjectId,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: itemTotalCost,
        lotNumber: item.lotNumber,
        expirationDate: item.expirationDate,
      });

      await InventoryMovement.create(
        [
          {
            organizationId: input.organizationId,
            storeId: input.storeId,
            productId: product._id,
            type: "purchase",
            quantity: item.quantity,
            previousStock: oldStock,
            newStock: newStock,
            unitCost: item.unitCost,
            totalCost: itemTotalCost,
            reason: `Recepcion de compra ref: ${input.referenceNumber}`,
            createdBy: input.userId,
          },
        ],
        { session }
      );
    }

    const [purchase] = await Purchase.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          supplierId: input.supplierId,
          referenceNumber: input.referenceNumber,
          purchaseDate: input.purchaseDate || new Date(),
          items: purchaseItems,
          subtotal: subtotalAcc,
          tax: 0,
          total: subtotalAcc,
          currency: "USD",
          exchangeRate: 1.0,
          status: "received",
          notes: input.notes,
          idempotencyKey: input.idempotencyKey,
          createdBy: input.userId,
        },
      ],
      { session }
    );

    await AuditLog.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          userId: input.userId,
          action: "purchase_received",
          entity: "Purchase",
          entityId: purchase._id,
          details: { referenceNumber: input.referenceNumber, total: subtotalAcc },
        },
      ],
      { session }
    );

    return purchase;
  });
}
