import { tool } from "ai";
import { z } from "zod";
import {
  getDailySummary,
  getTopProducts,
  getLowStockProducts,
  getInventoryValue,
  detectBusinessAnomalies,
  getPurchaseRecommendations,
} from "@/server/services/reportService";
import { Product } from "@/models/Product";
import { CashSession } from "@/models/CashSession";
import { Sale } from "@/models/Sale";
import { AuditLog } from "@/models/AuditLog";
import { connectDB } from "@/lib/db/mongodb";

export function createAITools(organizationId: string, storeId?: string) {
  return {
    get_daily_summary: tool({
      description:
        "Obtiene el resumen financiero y comercial determinista del día o rango de fechas seleccionado (ventas brutas, netas, ganancias, costos, gastos, ticket promedio, formas de pago).",
      parameters: z.object({
        date: z
          .string()
          .optional()
          .describe("Fecha ISO o YYYY-MM-DD. Si se omite, se usa el día de hoy."),
      }),
      execute: async ({ date }) => {
        await connectDB();
        const targetDate = date ? new Date(date) : new Date();
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        return await getDailySummary({
          startDate,
          endDate,
          organizationId,
          storeId,
        });
      },
    }),

    get_cash_close: tool({
      description:
        "Obtiene la información del cuadre de caja actual o más reciente (efectivo inicial, ventas por método de pago, retiradas, efectivo esperado y contado).",
      parameters: z.object({
        sessionId: z.string().optional().describe("ID de sesión de caja opcional."),
      }),
      execute: async ({ sessionId }) => {
        await connectDB();
        let query: any = { organizationId };
        if (sessionId) {
          query._id = sessionId;
        } else {
          query.status = "open";
        }

        let session = await CashSession.findOne(query).sort({ openedAt: -1 }).populate("userId", "name");
        if (!session) {
          session = await CashSession.findOne({ organizationId }).sort({ openedAt: -1 }).populate("userId", "name");
        }

        if (!session) {
          return { message: "No se encontraron sesiones de caja en la tienda." };
        }

        return {
          sessionId: session._id.toString(),
          registerName: session.registerName,
          cashierName: (session.userId as any)?.name || "Cajero",
          status: session.status,
          openedAt: session.openedAt,
          closedAt: session.closedAt,
          initialCash: session.initialCash,
          cashSalesTotal: session.cashSalesTotal,
          cardSalesTotal: session.cardSalesTotal,
          transferSalesTotal: session.transferSalesTotal,
          totalSales: session.totalSales,
          cashIns: session.cashIns,
          cashOuts: session.cashOuts,
          expectedCash: session.expectedCash,
          countedCash: session.countedCash,
          difference: session.difference,
          differenceReason: session.differenceReason,
        };
      },
    }),

    search_products: tool({
      description: "Busca productos en el catálogo por nombre, SKU o código de barras.",
      parameters: z.object({
        query: z.string().describe("Texto de búsqueda (nombre, marca, SKU o código)"),
        limit: z.number().optional().default(10),
      }),
      execute: async ({ query, limit }) => {
        await connectDB();
        const regex = new RegExp(query, "i");
        const products = await Product.find({
          organizationId,
          active: true,
          $or: [{ name: regex }, { sku: regex }, { barcode: regex }, { brand: regex }],
        })
          .populate("categoryId", "name")
          .limit(limit)
          .lean();

        return products.map((p: any) => ({
          id: p._id.toString(),
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          category: p.categoryId?.name || "Sin categoría",
          cost: p.cost,
          price: p.price,
          stock: p.stock,
          unit: p.unit,
        }));
      },
    }),

    get_product_stock: tool({
      description: "Consulta el inventario actual y disponibilidad exacta de un producto.",
      parameters: z.object({
        query: z.string().describe("Nombre o SKU del producto"),
      }),
      execute: async ({ query }) => {
        await connectDB();
        const regex = new RegExp(query, "i");
        const product: any = await Product.findOne({
          organizationId,
          active: true,
          $or: [{ sku: regex }, { name: regex }, { barcode: regex }],
        }).populate("categoryId", "name");

        if (!product) {
          return { found: false, message: `No se encontró el producto "${query}".` };
        }

        return {
          found: true,
          id: product._id.toString(),
          name: product.name,
          sku: product.sku,
          category: product.categoryId?.name,
          currentStock: product.stock,
          minStock: product.minStock,
          unit: product.unit,
          cost: product.cost,
          price: product.price,
          status: product.stock <= 0 ? "agotado" : product.stock <= product.minStock ? "bajo" : "disponible",
        };
      },
    }),

    get_top_products: tool({
      description: "Obtiene la lista de productos más vendidos en el período.",
      parameters: z.object({
        days: z.number().optional().default(7).describe("Días hacia atrás a analizar."),
        limit: z.number().optional().default(5).describe("Cantidad de productos a listar."),
        sortBy: z
          .enum(["quantity", "revenue", "profit"])
          .optional()
          .default("quantity")
          .describe("Criterio de ordenamiento."),
      }),
      execute: async ({ days, limit, sortBy }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await getTopProducts(organizationId, startDate, endDate, limit, sortBy);
      },
    }),

    get_low_stock_products: tool({
      description: "Detecta productos que están por debajo de su stock mínimo o próximos a agotarse.",
      parameters: z.object({
        limit: z.number().optional().default(20),
      }),
      execute: async ({ limit }) => {
        return await getLowStockProducts(organizationId, limit);
      },
    }),

    get_inventory_value: tool({
      description: "Calcula el valor total del inventario actual a precio de costo y su valor potencial de venta.",
      parameters: z.object({}),
      execute: async () => {
        return await getInventoryValue(organizationId);
      },
    }),

    detect_business_anomalies: tool({
      description:
        "Calcula y devuelve anomalías detectadas en las ventas y caja (diferencias de caja, ventas con margen negativo, stock negativo).",
      parameters: z.object({
        daysWindow: z.number().optional().default(7),
      }),
      execute: async ({ daysWindow }) => {
        return await detectBusinessAnomalies(organizationId, daysWindow);
      },
    }),

    get_purchase_recommendations: tool({
      description:
        "Genera sugerencias de reposición de compras basadas en la velocidad de venta diaria y tiempo de entrega de proveedores.",
      parameters: z.object({
        leadTimeDays: z.number().optional().default(5),
      }),
      execute: async ({ leadTimeDays }) => {
        return await getPurchaseRecommendations(organizationId, leadTimeDays);
      },
    }),

    get_audit_activity: tool({
      description: "Consulta los últimos registros de auditoría y operaciones administrativas.",
      parameters: z.object({
        limit: z.number().optional().default(10),
      }),
      execute: async ({ limit }) => {
        await connectDB();
        const logs = await AuditLog.find({ organizationId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("userId", "name email")
          .lean();

        return logs.map((l: any) => ({
          action: l.action,
          entity: l.entity,
          userName: l.userId?.name || "Sistema",
          details: l.details,
          date: l.createdAt,
        }));
      },
    }),

    propose_inventory_receipt: tool({
      description:
        "Prepara una propuesta estructurada de entrada de mercancía (recepción de compras) para que el usuario revise y confirme expresamente.",
      parameters: z.object({
        productNameOrSku: z.string().describe("Nombre o SKU del producto"),
        quantity: z.number().min(1).describe("Cantidad de unidades"),
        unitCost: z.number().min(0).describe("Costo unitario"),
      }),
      execute: async ({ productNameOrSku, quantity, unitCost }) => {
        await connectDB();
        const product = await Product.findOne({
          organizationId,
          $or: [{ sku: productNameOrSku }, { name: new RegExp(productNameOrSku, "i") }],
        });

        return {
          type: "PROPOSAL_INVENTORY_RECEIPT",
          requiresConfirmation: true,
          proposalData: {
            productId: product ? product._id.toString() : null,
            productName: product ? product.name : productNameOrSku,
            sku: product ? product.sku : "NUEVO",
            quantity,
            unitCost,
            totalCost: quantity * unitCost,
          },
          message: `He preparado la propuesta de entrada de mercancía para ${quantity} unidades de "${
            product ? product.name : productNameOrSku
          }" a $${unitCost} c/u. Por favor haz clic en "Confirmar Entrada" para registrar la operación en la base de datos.`,
        };
      },
    }),
  };
}
