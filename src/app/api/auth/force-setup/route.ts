import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { Store } from "@/models/Store";
import { Settings } from "@/models/Settings";
import { hashPassword } from "@/lib/auth/jwt";
import mongoose from "mongoose";

/**
 * GET /api/auth/force-setup
 * Fuerza la limpieza absoluta de todos los usuarios y crea la cuenta administradora especificada.
 */
export async function GET() {
  try {
    await connectDB();

    // 1. Limpiar todos los usuarios, organizaciones, sucursales y ajustes existentes
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Store.deleteMany({}),
      Settings.deleteMany({}),
    ]);

    const adminPasswordHash = await hashPassword("Osvaldo.RN8");
    const userId = new mongoose.Types.ObjectId();

    // 2. Crear nueva Organización
    const organization = await Organization.create({
      name: "El Arca Market",
      ownerId: userId,
      active: true,
    });

    // 3. Crear Sucursal Principal
    const store = await Store.create({
      organizationId: organization._id,
      name: "El Arca Market - Sucursal Principal",
      code: "SUC-01",
      active: true,
    });

    // 4. Crear Usuario Administrador Principal
    const adminUser = await User.create({
      _id: userId,
      organizationId: organization._id,
      storeId: store._id,
      name: "Osvaldo Appel",
      email: "osvaldojesusappel@gmail.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      active: true,
    });

    // 5. Crear Ajustes Iniciales
    await Settings.create({
      organizationId: organization._id,
      storeId: store._id,
      businessName: "El Arca Market",
      currency: "USD",
      currencySymbol: "$",
      decimalPlaces: 2,
      allowNegativeStock: false,
      requireCashSessionForSales: true,
    });

    return NextResponse.json({
      success: true,
      message: "¡Sistema reconfigurado con éxito en MongoDB Atlas!",
      usuario_creado: adminUser.email,
      contrasena: "Osvaldo.RN8",
      rol: adminUser.role,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en force-setup:", errMessage);
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
