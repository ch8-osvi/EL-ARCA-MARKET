import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { CashSession } from "@/models/CashSession";
import { openCashSession, closeCashSession, recordCashMovement } from "@/server/services/cashService";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query: any = { status: "open" };
    if (userId) {
      query.userId = userId;
    }

    let session = await CashSession.findOne(query).sort({ openedAt: -1 }).populate("userId", "name email");
    if (!session) {
      session = await CashSession.findOne().sort({ openedAt: -1 }).populate("userId", "name email");
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { action } = body;

    let user = await User.findOne({ email: "admin@elarcamarket.com" });
    if (!user) user = await User.findOne();
    const defaultOrgId = user?.organizationId.toString() || new Array(24).fill("0").join("");
    const defaultUserId = user?._id.toString() || new Array(24).fill("0").join("");

    if (action === "open") {
      const { initialCash, registerName } = body;
      const session = await openCashSession(
        body.organizationId || defaultOrgId,
        body.userId || defaultUserId,
        Number(initialCash || 0),
        registerName || "Caja Principal",
        body.storeId
      );
      return NextResponse.json({ success: true, session });
    }

    if (action === "close") {
      const { sessionId, countedCash, notes, differenceReason } = body;
      const session = await closeCashSession(
        sessionId,
        Number(countedCash || 0),
        body.userId || defaultUserId,
        notes,
        differenceReason
      );
      return NextResponse.json({ success: true, session });
    }

    if (action === "movement") {
      const { sessionId, type, amount, reason, category } = body;
      const movement = await recordCashMovement(
        body.organizationId || defaultOrgId,
        sessionId,
        type,
        Number(amount),
        reason,
        body.userId || defaultUserId,
        category
      );
      return NextResponse.json({ success: true, movement });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
