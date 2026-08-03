import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { Store } from "@/models/Store";
import { hashPassword, verifyToken } from "@/lib/auth/jwt";

/**
 * Helper para verificar si la petición viene de un Admin autenticado.
 */
async function authenticateAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const cookieHeader = req.headers.get("cookie");

  let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token && cookieHeader) {
    const match = cookieHeader.match(/arca_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;

  return payload;
}

/**
 * GET /api/users
 * Lista todos los usuarios registrados en el sistema.
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener usuarios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Registra un nuevo usuario con rol asignado (Admin, Supervisor, Cajero).
 */
export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nombre, correo, contraseña y rol son obligatorios." },
        { status: 400 }
      );
    }

    if (!["admin", "supervisor", "cashier"].includes(role)) {
      return NextResponse.json(
        { error: "El rol seleccionado no es válido." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con este correo electrónico." },
        { status: 400 }
      );
    }

    // Obtener la organización y tienda por defecto si existen
    const organization = await Organization.findOne({});
    const store = await Store.findOne({});

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      organizationId: organization?._id,
      storeId: store?._id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      active: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
      message: `Usuario ${newUser.name} (${role}) creado exitosamente.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear usuario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/users
 * Cambia el rol o el estado activo/inactivo de un usuario.
 */
export async function PATCH(req: Request) {
  try {
    const { userId, role, active } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es requerido." }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {};
    if (role && ["admin", "supervisor", "cashier"].includes(role)) {
      updateData.role = role;
    }
    if (typeof active === "boolean") {
      updateData.active = active;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar usuario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/users
 * Elimina un usuario por su ID.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es requerido." }, { status: 400 });
    }

    await connectDB();

    const totalAdmins = await User.countDocuments({ role: "admin", active: true });
    const userToDelete = await User.findById(userId);

    if (userToDelete?.role === "admin" && totalAdmins <= 1) {
      return NextResponse.json(
        { error: "No puedes eliminar el único Administrador del sistema." },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: "Usuario eliminado exitosamente." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar usuario";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
