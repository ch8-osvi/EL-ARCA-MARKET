import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { verifyPassword, signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "El usuario no tiene una contraseña configurada." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Verifica tu contraseña." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const orgIdStr = user.organizationId ? user.organizationId.toString() : "";
    const storeIdStr = user.storeId ? user.storeId.toString() : "";

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: storeIdStr,
      organizationId: orgIdStr,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: storeIdStr,
        organizationId: orgIdStr,
      },
    });

    // Establecer cookie de sesión para el middleware de Next.js
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
    const errMessage = error instanceof Error ? error.message : "Error al procesar el inicio de sesión";
    console.error("🔴 Error en login:", errMessage);
    return NextResponse.json(
      { error: `Error en inicio de sesión: ${errMessage}` },
      { status: 500 }
    );
  }
}
