import { NextResponse } from "next/server";
import { createSale } from "@/server/services/posService";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    let {
      organizationId,
      storeId,
      cashierId,
      cashSessionId,
      customerName,
      items,
      payments,
      cashReceived,
      idempotencyKey,
      notes,
    } = body;

    // Generar idempotencyKey si no viene en la solicitud
    if (!idempotencyKey) {
      idempotencyKey = `POS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    if (!organizationId || !cashierId) {
      const defaultUser = await User.findOne().sort({ createdAt: 1 });
      if (defaultUser) {
        organizationId = organizationId || defaultUser.organizationId.toString();
        cashierId = cashierId || defaultUser._id.toString();
        storeId = storeId || defaultUser.storeId?.toString();
      }
    }

    const sale = await createSale({
      organizationId,
      storeId,
      cashierId,
      cashSessionId,
      customerName,
      items,
      payments,
      cashReceived,
      idempotencyKey,
      notes,
    });

    return NextResponse.json({ success: true, sale });
  } catch (error: any) {
    console.error("Error al procesar la venta:", error);
    return NextResponse.json({ error: error.message || "Error al procesar la venta." }, { status: 400 });
  }
}
