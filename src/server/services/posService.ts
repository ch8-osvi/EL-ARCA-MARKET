import mongoose from "mongoose";
import { connectDB, runInTransaction } from "@/lib/db/mongodb";
import { Sale, ISaleItem, IPayment } from "@/models/Sale";
import { Product } from "@/models/Product";
import { InventoryMovement } from "@/models/InventoryMovement";
import { CashSession } from "@/models/CashSession";
import { AuditLog } from "@/models/AuditLog";
import { multiplyMoney, sumMoney, subtractMoney } from "@/lib/money";

export interface CreateSaleInput {
  organizationId: string;
  storeId?: string;
  cashierId: string;
  cashSessionId?: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  payments: {
    method: "cash" | "card" | "transfer" | "other";
    amount: number;
    reference?: string;
  }[];
  cashReceived?: number;
  idempotencyKey: string;
  notes?: string;
}

export async function createSale(input: CreateSaleInput) {
  await connectDB();

  // 1. Verificación de Idempotencia previa fuera de transacción para respuesta rápida
  const existingSale = await Sale.findOne({ idempotencyKey: input.idempotencyKey });
  if (existingSale) {
    return existingSale;
  }

  return await runInTransaction(async (session) => {
    // 2. Verificar Sesión de Caja activa si se proporcionó
    let cashSession = null;
    if (input.cashSessionId) {
      cashSession = await CashSession.findById(input.cashSessionId).session(session);
      if (!cashSession || cashSession.status === "closed") {
        throw new Error("La sesión de caja seleccionada no está abierta.");
      }
    }

    // 3. Procesar Productos y calcular importes históricos
    const saleItems: ISaleItem[] = [];
    let subtotalAcc = 0;
    let discountAcc = 0;
    let totalCostAcc = 0;

    for (const item of input.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.active) {
        throw new Error(`El producto con ID ${item.productId} no existe o está inactivo.`);
      }

      // Validar existencias si no permite stock negativo ni es servicio
      if (
        product.controlType !== "service" &&
        !product.allowNegativeStock &&
        product.stock < item.quantity
      ) {
        throw new Error(
          `Stock insuficiente para "${product.name}". Solicitado: ${item.quantity}, Disponible: ${product.stock}`
        );
      }

      const discount = item.discount || 0;
      const unitPrice = item.unitPrice;
      const itemSubtotal = multiplyMoney(unitPrice, item.quantity);
      const itemTotal = Math.max(0, subtractMoney(itemSubtotal, discount));
      const itemCostTotal = multiplyMoney(product.cost, item.quantity);

      subtotalAcc = sumMoney([subtotalAcc, itemSubtotal]);
      discountAcc = sumMoney([discountAcc, discount]);
      totalCostAcc = sumMoney([totalCostAcc, itemCostTotal]);

      saleItems.push({
        productId: product._id as mongoose.Types.ObjectId,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        unit: product.unit,
        quantity: item.quantity,
        unitPrice: unitPrice,
        unitCost: product.cost,
        discount: discount,
        subtotal: itemSubtotal,
        total: itemTotal,
      });

      // 4. Actualizar Stock del Producto
      if (product.controlType !== "service") {
        const previousStock = product.stock;
        const newStock = previousStock - item.quantity;
        product.stock = newStock;
        await product.save({ session });

        // 5. Registrar Movimiento Inmutable de Inventario (Kardex)
        await InventoryMovement.create(
          [
            {
              organizationId: input.organizationId,
              storeId: input.storeId,
              productId: product._id,
              type: "sale",
              quantity: -item.quantity,
              previousStock: previousStock,
              newStock: newStock,
              unitCost: product.cost,
              totalCost: itemCostTotal,
              referenceType: "Sale",
              idempotencyKey: `${input.idempotencyKey}-${product._id}`,
              createdBy: input.cashierId,
              reason: "Venta en Punto de Venta",
            },
          ],
          { session }
        );
      }
    }

    const grandTotal = Math.max(0, subtractMoney(subtotalAcc, discountAcc));
    const grossProfit = subtractMoney(grandTotal, totalCostAcc);

    // 6. Validar Cuadre de Pagos
    const totalPayments = sumMoney(input.payments.map((p) => p.amount));
    if (totalPayments < grandTotal) {
      throw new Error(
        `Monto de pago insuficiente. Total venta: ${grandTotal}, Pagado: ${totalPayments}`
      );
    }

    const cashPayment = input.payments.find((p) => p.method === "cash")?.amount || 0;
    const cardPayment = input.payments.find((p) => p.method === "card")?.amount || 0;
    const transferPayment = input.payments.find((p) => p.method === "transfer")?.amount || 0;
    const otherPayment = input.payments.find((p) => p.method === "other")?.amount || 0;

    const cashReceived = input.cashReceived || cashPayment;
    const changeGiven = Math.max(0, subtractMoney(cashReceived, cashPayment));

    // 7. Generar Número de Recibo correlativo/único
    const receiptNumber = `REC-${Date.now().toString().slice(-8)}-${Math.floor(
      Math.random() * 1000
    )}`;

    // 8. Crear Registro de Venta
    const [newSale] = await Sale.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          receiptNumber: receiptNumber,
          cashSessionId: input.cashSessionId,
          cashierId: input.cashierId,
          customerName: input.customerName || "Cliente General",
          items: saleItems,
          subtotal: subtotalAcc,
          discountTotal: discountAcc,
          taxTotal: 0,
          total: grandTotal,
          totalCost: totalCostAcc,
          grossProfit: grossProfit,
          payments: input.payments,
          cashReceived: cashReceived,
          changeGiven: changeGiven,
          currency: "USD",
          exchangeRate: 1.0,
          status: "completed",
          idempotencyKey: input.idempotencyKey,
          notes: input.notes,
        },
      ],
      { session }
    );

    // 9. Actualizar Totales de la Sesión de Caja
    if (cashSession) {
      cashSession.cashSalesTotal = sumMoney([cashSession.cashSalesTotal, cashPayment]);
      cashSession.cardSalesTotal = sumMoney([cashSession.cardSalesTotal, cardPayment]);
      cashSession.transferSalesTotal = sumMoney([cashSession.transferSalesTotal, transferPayment]);
      cashSession.otherSalesTotal = sumMoney([cashSession.otherSalesTotal, otherPayment]);
      cashSession.totalSales = sumMoney([cashSession.totalSales, grandTotal]);
      cashSession.expectedCash = sumMoney([
        cashSession.initialCash,
        cashSession.cashSalesTotal,
        cashSession.cashIns,
        -cashSession.cashOuts,
        -cashSession.customerRefundsCash,
      ]);
      await cashSession.save({ session });
    }

    // 10. Auditoría
    await AuditLog.create(
      [
        {
          organizationId: input.organizationId,
          storeId: input.storeId,
          userId: input.cashierId,
          action: "sale_created",
          entity: "Sale",
          entityId: newSale._id,
          details: { receiptNumber, total: grandTotal, itemsCount: saleItems.length },
        },
      ],
      { session }
    );

    return newSale;
  });
}
