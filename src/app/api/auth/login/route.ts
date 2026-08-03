import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { verifyPassword, signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    await connectDB();

    // Validar si la base de datos está totalmente vacía
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      return NextResponse.json({
        success: false,
        setupRequired: true,
        error: "No hay usuarios registrados en el sistema. Debes realizar la configuración inicial.",
      }, { status: 200 }); // Status 200 para que el cliente lea la propiedad setupRequired
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.storeId?.toString(),
      organizationId: user.organizationId.toString(),
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId?.toString(),
        organizationId: user.organizationId.toString(),
      },
    });

    // Establecer cookie seguro de sesión de 7 días para el middleware de Next.js
    response.cookies.set({
      name: "arca_token",
      value: token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error al conectar con la base de datos";
    console.error("🔴 Error en login:", errMessage);
    return NextResponse.json({ 
      error: `Error de conexión / base de datos: ${errMessage}. Verifica tu MONGODB_URI y el acceso de red IP en Atlas.` 
    }, { status: 500 });
  }
}
