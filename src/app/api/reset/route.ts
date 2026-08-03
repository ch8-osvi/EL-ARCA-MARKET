import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { CashSession } from "@/models/CashSession";
import { CashMovement } from "@/models/CashMovement";
import { InventoryMovement } from "@/models/InventoryMovement";
import { Expense } from "@/models/Expense";
import { Category } from "@/models/Category";
import { Supplier } from "@/models/Supplier";
import { AIToolExecution } from "@/models/AIToolExecution";
import { AuditLog } from "@/models/AuditLog";
import { Purchase } from "@/models/Purchase";
import { Return } from "@/models/Return";

/**
 * GET /api/reset
 * Limpia todos los datos de demo/prueba de la base de datos.
 * Conserva: Organización, Sucursal, Usuarios y Configuración.
 * Elimina: Productos, Ventas, Caja, Movimientos, Gastos, Categorías, Proveedores.
 */
export async function GET() {
  try {
    await connectDB();

    // ── Eliminar toda la data operativa y de catálogo ──
    await Promise.all([
      Sale.deleteMany({}),
      CashSession.deleteMany({}),
      CashMovement.deleteMany({}),
      InventoryMovement.deleteMany({}),
      Expense.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      AIToolExecution.deleteMany({}),
      AuditLog.deleteMany({}),
      Purchase.deleteMany({}),
      Return.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: "✅ Base de datos limpiada. La app está lista para uso real. Se conservaron: usuarios, organización, sucursal y configuración.",
      eliminado: [
        "Productos",
        "Ventas",
        "Sesiones de Caja",
        "Movimientos de Caja",
        "Movimientos de Inventario",
        "Gastos",
        "Categorías",
        "Proveedores",
        "Logs de IA",
        "Auditoría",
        "Compras",
        "Devoluciones",
      ],
      conservado: ["Usuarios", "Organización", "Sucursal", "Configuración"],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en reset:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
