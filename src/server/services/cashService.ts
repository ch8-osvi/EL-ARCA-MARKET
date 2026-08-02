import { connectDB, runInTransaction } from "@/lib/db/mongodb";
import { CashSession } from "@/models/CashSession";
import { CashMovement } from "@/models/CashMovement";
import { AuditLog } from "@/models/AuditLog";
import { sumMoney, subtractMoney } from "@/lib/money";

export async function openCashSession(
  organizationId: string,
  userId: string,
  initialCash: number,
  registerName: string = "Caja Principal",
  storeId?: string
) {
  await connectDB();

  // Verificar si ya existe una sesión abierta para el usuario/caja
  const activeSession = await CashSession.findOne({
    organizationId,
    userId,
    status: "open",
  });

  if (activeSession) {
    return activeSession;
  }

  const newSession = await CashSession.create({
    organizationId,
    storeId,
    userId,
    registerName,
    openedAt: new Date(),
    initialCash,
    cashSalesTotal: 0,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    otherSalesTotal: 0,
    totalSales: 0,
    cashIns: 0,
    cashOuts: 0,
    customerRefundsCash: 0,
    expectedCash: initialCash,
    status: "open",
  });

  await AuditLog.create({
    organizationId,
    storeId,
    userId,
    action: "cash_opened",
    entity: "CashSession",
    entityId: newSession._id,
    details: { initialCash, registerName },
  });

  return newSession;
}

export async function recordCashMovement(
  organizationId: string,
  cashSessionId: string,
  type: "in" | "out",
  amount: number,
  reason: string,
  userId: string,
  category: string = "general"
) {
  await connectDB();

  return await runInTransaction(async (session) => {
    const cashSession = await CashSession.findById(cashSessionId).session(session);
    if (!cashSession || cashSession.status === "closed") {
      throw new Error("La sesión de caja no está abierta.");
    }

    const movement = await CashMovement.create(
      [
        {
          organizationId,
          cashSessionId,
          type,
          amount,
          reason,
          category,
          createdBy: userId,
        },
      ],
      { session }
    );

    if (type === "in") {
      cashSession.cashIns = sumMoney([cashSession.cashIns, amount]);
    } else {
      cashSession.cashOuts = sumMoney([cashSession.cashOuts, amount]);
    }

    cashSession.expectedCash = sumMoney([
      cashSession.initialCash,
      cashSession.cashSalesTotal,
      cashSession.cashIns,
      -cashSession.cashOuts,
      -cashSession.customerRefundsCash,
    ]);

    await cashSession.save({ session });

    await AuditLog.create(
      [
        {
          organizationId,
          userId,
          action: type === "in" ? "cash_in" : "cash_out",
          entity: "CashSession",
          entityId: cashSession._id,
          details: { amount, reason, type },
        },
      ],
      { session }
    );

    return movement[0];
  });
}

export async function closeCashSession(
  cashSessionId: string,
  countedCash: number,
  userId: string,
  notes?: string,
  differenceReason?: string
) {
  await connectDB();

  return await runInTransaction(async (session) => {
    const cashSession = await CashSession.findById(cashSessionId).session(session);
    if (!cashSession || cashSession.status === "closed") {
      throw new Error("La sesión de caja ya se encuentra cerrada o no existe.");
    }

    const expectedCash = sumMoney([
      cashSession.initialCash,
      cashSession.cashSalesTotal,
      cashSession.cashIns,
      -cashSession.cashOuts,
      -cashSession.customerRefundsCash,
    ]);

    const difference = subtractMoney(countedCash, expectedCash);

    cashSession.countedCash = countedCash;
    cashSession.expectedCash = expectedCash;
    cashSession.difference = difference;
    cashSession.differenceReason = differenceReason;
    cashSession.closedAt = new Date();
    cashSession.closedBy = userId as any;
    cashSession.notes = notes;
    cashSession.status = "closed";

    await cashSession.save({ session });

    await AuditLog.create(
      [
        {
          organizationId: cashSession.organizationId,
          userId,
          action: "cash_closed",
          entity: "CashSession",
          entityId: cashSession._id,
          details: { expectedCash, countedCash, difference },
        },
      ],
      { session }
    );

    return cashSession;
  });
}
