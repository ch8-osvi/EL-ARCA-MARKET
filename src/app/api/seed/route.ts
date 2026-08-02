import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/seed";

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada exitosamente con catálogo y usuarios de prueba.",
    });
  } catch (error: any) {
    console.error("Error en seed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
