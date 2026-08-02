import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { Sale } from "@/models/Sale";
import { Product } from "@/models/Product";
import { CashSession } from "@/models/CashSession";
import { Expense } from "@/models/Expense";
import { Return } from "@/models/Return";
import { AuditLog } from "@/models/AuditLog";
import { sumMoney, subtractMoney, calculateGrossMargin } from "@/lib/money";

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
  organizationId: string;
  storeId?: string;
}

export async function getDailySummary(filter: DateRangeFilter) {
  await connectDB();

  const orgId = new mongoose.Types.ObjectId(filter.organizationId);

  const matchQuery: any = {
    organizationId: orgId,
    createdAt: { $gte: filter.startDate, $lte: filter.endDate },
    status: "completed",
  };

  if (filter.storeId) {
    matchQuery.storeId = new mongoose.Types.ObjectId(filter.storeId);
  }

  // 1. Agregación de Ventas
  const salesStats = await Sale.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalGrossSales: { $sum: "$subtotal" },
        totalDiscounts: { $sum: "$discountTotal" },
        totalNetSales: { $sum: "$total" },
        totalCostOfGoods: { $sum: "$totalCost" },
        grossProfit: { $sum: "$grossProfit" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const stats = salesStats[0] || {
    totalGrossSales: 0,
    totalDiscounts: 0,
    totalNetSales: 0,
    totalCostOfGoods: 0,
    grossProfit: 0,
    transactionCount: 0,
  };

  // 2. Gastos del Período
  const expensesStats = await Expense.aggregate([
    {
      $match: {
        organizationId: orgId,
        createdAt: { $gte: filter.startDate, $lte: filter.endDate },
      },
    },
    { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
  ]);

  const totalExpense = expensesStats[0]?.totalExpense || 0;
  const netEstimatedProfit = subtractMoney(stats.grossProfit, totalExpense);

  // 3. Devoluciones del Período
  const returnsStats = await Return.aggregate([
    {
      $match: {
        organizationId: orgId,
        createdAt: { $gte: filter.startDate, $lte: filter.endDate },
      },
    },
    { $group: { _id: null, totalRefund: { $sum: "$totalRefund" } } },
  ]);

  const totalRefunds = returnsStats[0]?.totalRefund || 0;

  // 4. Métodos de Pago
  const paymentMethods = await Sale.aggregate([
    { $match: matchQuery },
    { $unwind: "$payments" },
    {
      $group: {
        _id: "$payments.method",
        total: { $sum: "$payments.amount" },
      },
    },
  ]);

  const paymentsMap: Record<string, number> = {
    cash: 0,
    card: 0,
    transfer: 0,
    other: 0,
  };

  for (const pm of paymentMethods) {
    paymentsMap[pm._id] = pm.total;
  }

  // 5. Unidades Totales Vendidas
  const unitsStats = await Sale.aggregate([
    { $match: matchQuery },
    { $unwind: "$items" },
    { $group: { _id: null, totalUnits: { $sum: "$items.quantity" } } },
  ]);

  const totalUnitsSold = unitsStats[0]?.totalUnits || 0;
  const averageTicket =
    stats.transactionCount > 0 ? stats.totalNetSales / stats.transactionCount : 0;

  return {
    period: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    totalGrossSales: stats.totalGrossSales,
    totalDiscounts: stats.totalDiscounts,
    totalRefunds: totalRefunds,
    totalNetSales: stats.totalNetSales,
    totalCostOfGoods: stats.totalCostOfGoods,
    grossProfit: stats.grossProfit,
    grossMarginPercent: calculateGrossMargin(stats.totalNetSales, stats.totalCostOfGoods),
    operatingExpenses: totalExpense,
    netEstimatedProfit: netEstimatedProfit,
    transactionCount: stats.transactionCount,
    averageTicket: Math.round(averageTicket * 100) / 100,
    totalUnitsSold: totalUnitsSold,
    paymentsBreakdown: paymentsMap,
  };
}

export async function getTopProducts(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 5,
  sortBy: "quantity" | "revenue" | "profit" = "quantity"
) {
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const sortField =
    sortBy === "quantity" ? "totalQuantity" : sortBy === "revenue" ? "totalRevenue" : "totalProfit";

  const result = await Sale.aggregate([
    {
      $match: {
        organizationId: orgId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: "completed",
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.total" },
        totalCost: { $sum: { $multiply: ["$items.unitCost", "$items.quantity"] } },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        sku: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        totalCost: 1,
        totalProfit: { $subtract: ["$totalRevenue", "$totalCost"] },
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
  ]);

  return result;
}

export async function getLowStockProducts(organizationId: string, limit: number = 50) {
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const lowStockItems = await Product.find({
    organizationId: orgId,
    active: true,
    controlType: { $ne: "service" },
    $expr: { $lte: ["$stock", "$minStock"] },
  })
    .populate("categoryId", "name")
    .sort({ stock: 1 })
    .limit(limit)
    .lean();

  return lowStockItems.map((p: any) => ({
    _id: p._id.toString(),
    sku: p.sku,
    name: p.name,
    categoryName: p.categoryId?.name || "Sin categoría",
    currentStock: p.stock,
    minStock: p.minStock,
    unit: p.unit,
    cost: p.cost,
    price: p.price,
    deficit: Math.max(0, p.minStock - p.stock),
  }));
}

export async function getInventoryValue(organizationId: string) {
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const result = await Product.aggregate([
    {
      $match: {
        organizationId: orgId,
        active: true,
        controlType: { $ne: "service" },
      },
    },
    {
      $group: {
        _id: null,
        totalItemsCount: { $sum: 1 },
        totalStockUnits: { $sum: "$stock" },
        totalCostValue: { $sum: { $multiply: ["$cost", "$stock"] } },
        totalSaleValue: { $sum: { $multiply: ["$price", "$stock"] } },
      },
    },
  ]);

  const summary = result[0] || {
    totalItemsCount: 0,
    totalStockUnits: 0,
    totalCostValue: 0,
    totalSaleValue: 0,
  };

  const potentialProfit = subtractMoney(summary.totalSaleValue, summary.totalCostValue);

  return {
    totalItemsCount: summary.totalItemsCount,
    totalStockUnits: summary.totalStockUnits,
    totalCostValue: summary.totalCostValue,
    totalSaleValue: summary.totalSaleValue,
    potentialProfit: potentialProfit,
    potentialMarginPercent: calculateGrossMargin(
      summary.totalSaleValue,
      summary.totalCostValue
    ),
  };
}

export async function detectBusinessAnomalies(organizationId: string, daysWindow: number = 7) {
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(organizationId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysWindow);

  const anomalies: any[] = [];

  // 1. Diferencias significativas en cierre de caja (> $5 o $50 segun moneda)
  const cashAnomalies = await CashSession.find({
    organizationId: orgId,
    closedAt: { $gte: startDate },
    difference: { $ne: 0 },
  }).populate("userId", "name");

  for (const cs of cashAnomalies) {
    if (Math.abs(cs.difference || 0) > 2) {
      anomalies.push({
        type: "cash_difference",
        severity: Math.abs(cs.difference || 0) > 10 ? "high" : "medium",
        title: "Diferencia en Cuadre de Caja",
        description: `La caja "${cs.registerName}" a cargo de ${
          (cs.userId as any)?.name || "Cajero"
        } registró una diferencia de ${cs.difference} en su cierre.`,
        observedValue: cs.difference,
        expectedValue: 0,
        date: cs.closedAt,
      });
    }
  }

  // 2. Ventas con margen negativo (Precio de venta menor al costo)
  const negativeMarginSales = await Sale.find({
    organizationId: orgId,
    createdAt: { $gte: startDate },
    grossProfit: { $lt: 0 },
    status: "completed",
  });

  for (const sale of negativeMarginSales) {
    anomalies.push({
      type: "negative_margin_sale",
      severity: "high",
      title: "Venta con Margen Negativo",
      description: `La venta recibo ${sale.receiptNumber} fue procesada por debajo del costo acumulado. Ganancia: ${sale.grossProfit}.`,
      observedValue: sale.grossProfit,
      date: sale.createdAt,
    });
  }

  // 3. Productos vendidos sin existencias (Stock negativo)
  const negativeStockProducts = await Product.find({
    organizationId: orgId,
    active: true,
    controlType: { $ne: "service" },
    stock: { $lt: 0 },
  });

  for (const p of negativeStockProducts) {
    anomalies.push({
      type: "negative_stock",
      severity: "medium",
      title: "Stock Negativo Detectado",
      description: `El producto "${p.name}" (SKU: ${p.sku}) tiene un inventario de ${p.stock} unidades.`,
      observedValue: p.stock,
      date: new Date(),
    });
  }

  return anomalies;
}

export async function getPurchaseRecommendations(
  organizationId: string,
  daysOfLeadTime: number = 5,
  safetyStockDays: number = 3
) {
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Calcular venta promedio diaria de los ultimos 30 dias por producto
  const salesVelocity = await Sale.aggregate([
    {
      $match: {
        organizationId: orgId,
        createdAt: { $gte: thirtyDaysAgo },
        status: "completed",
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold30Days: { $sum: "$items.quantity" },
      },
    },
  ]);

  const velocityMap = new Map<string, number>();
  for (const sv of salesVelocity) {
    velocityMap.set(sv._id.toString(), sv.totalSold30Days / 30);
  }

  const products = await Product.find({
    organizationId: orgId,
    active: true,
    controlType: { $ne: "service" },
  })
    .populate("supplierId", "name")
    .lean();

  const recommendations = [];

  for (const p of products) {
    const dailyAvg = velocityMap.get((p._id as any).toString()) || 0;
    const demandDuringLeadTime = dailyAvg * daysOfLeadTime;
    const safetyStock = dailyAvg * safetyStockDays;
    const targetStock = Math.ceil(demandDuringLeadTime + safetyStock + (p.minStock || 5));

    const currentAvailable = p.stock;

    if (currentAvailable < targetStock) {
      const suggestedQuantity = Math.max(1, targetStock - currentAvailable);
      const estimatedCost = multiplyMoney(p.cost, suggestedQuantity);
      const daysRemaining = dailyAvg > 0 ? Math.round(currentAvailable / dailyAvg) : 999;

      recommendations.push({
        productId: (p._id as any).toString(),
        sku: p.sku,
        name: p.name,
        currentStock: currentAvailable,
        minStock: p.minStock,
        dailyAvgSales: Math.round(dailyAvg * 100) / 100,
        suggestedQuantity,
        estimatedCost,
        daysRemaining: daysRemaining === 999 ? "Sin ventas recientes" : daysRemaining,
        supplierName: (p.supplierId as any)?.name || "Proveedor no asignado",
        reason: `Se venden aprox. ${(Math.round(dailyAvg * 10) / 10)} unid/día. Quedan ${currentAvailable} unid y el tiempo de reposición es de ${daysOfLeadTime} días.`,
      });
    }
  }

  return recommendations.sort((a, b) => (typeof a.daysRemaining === "number" ? a.daysRemaining : 999) - (typeof b.daysRemaining === "number" ? b.daysRemaining : 999));
}
