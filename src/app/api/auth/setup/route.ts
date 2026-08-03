import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { Store } from "@/models/Store";
import { Settings } from "@/models/Settings";
import { hashPassword } from "@/lib/auth/jwt";
import mongoose from "mongoose";

/**
 * POST /api/auth/setup
 * Permite registrar el primer usuario administrador, organización y sucursal.
 * Sólo funciona si no hay ningún usuario registrado en la base de datos (seguridad total).
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    // 1. Validar que la base de datos no tenga usuarios
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      return NextResponse.json(
        { error: "El sistema ya está inicializado. No se permiten registros iniciales adicionales." },
        { status: 400 }
      );
    }

    const { name, email, password, businessName } = await req.json();

    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios (Nombre, Correo, Contraseña y Nombre de la Tienda)." },
        { status: 400 }
      );
    }

    const adminPasswordHash = await hashPassword(password);
    const userId = new mongoose.Types.ObjectId();

    // 2. Crear Organización
    const organization = await Organization.create({
      name: businessName,
      ownerId: userId,
      active: true,
    });

    // 3. Crear Sucursal Principal
    const store = await Store.create({
      organizationId: organization._id,
      name: `${businessName} - Sucursal Principal`,
      code: "SUC-01",
      active: true,
    });

    // 4. Crear Usuario Administrador Principal
    const adminUser = await User.create({
      _id: userId,
      organizationId: organization._id,
      storeId: store._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: adminPasswordHash,
      role: "admin",
      active: true,
    });

    // 5. Crear Ajustes Iniciales
    await Settings.create({
      organizationId: organization._id,
      storeId: store._id,
      businessName: businessName,
      currency: "USD",
      currencySymbol: "$",
      decimalPlaces: 2,
      allowNegativeStock: false,
      requireCashSessionForSales: true,
    });

    return NextResponse.json({
      success: true,
      message: "¡Sistema inicializado exitosamente! Tu cuenta de administrador ha sido creada.",
      user: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en setup:", errMessage);
    return NextResponse.json({ error: `Error en setup del sistema: ${errMessage}` }, { status: 500 });
  }
}

/**
 * GET /api/auth/setup
 * Informa si el sistema requiere configuración inicial o si ya está inicializado.
 */
export async function GET() {
  try {
    await connectDB();
    const userCount = await User.countDocuments({});
    return NextResponse.json({
      setupRequired: userCount === 0,
      message: userCount === 0 
        ? "El sistema requiere configuración inicial." 
        : "El sistema ya está inicializado.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error de conexión a la BD";
    return NextResponse.json({ error: `Error al verificar estado de la BD: ${errMessage}` }, { status: 500 });
  }
}
