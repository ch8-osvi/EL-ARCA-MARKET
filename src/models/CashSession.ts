import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICashSession extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registerName: string; // ej. "Caja Principal"
  openedAt: Date;
  closedAt?: Date;
  initialCash: number;
  cashSalesTotal: number;
  cardSalesTotal: number;
  transferSalesTotal: number;
  otherSalesTotal: number;
  totalSales: number;
  cashIns: number; // Entradas manuales de efectivo
  cashOuts: number; // Salidas manuales de efectivo (ej. retiro o pago de gasto)
  customerRefundsCash: number; // Devoluciones en efectivo
  expectedCash: number; // initialCash + cashSalesTotal + cashIns - cashOuts - customerRefundsCash
  countedCash?: number; // Efectivo físico contado al cerrar
  difference?: number; // countedCash - expectedCash
  differenceReason?: string;
  status: "open" | "closed" | "reopened";
  closedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CashSessionSchema = new Schema<ICashSession>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    registerName: { type: String, default: "Caja Principal", required: true },
    openedAt: { type: Date, default: Date.now, required: true },
    closedAt: { type: Date },
    initialCash: { type: Number, required: true, min: 0 },
    cashSalesTotal: { type: Number, default: 0, min: 0 },
    cardSalesTotal: { type: Number, default: 0, min: 0 },
    transferSalesTotal: { type: Number, default: 0, min: 0 },
    otherSalesTotal: { type: Number, default: 0, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    cashIns: { type: Number, default: 0, min: 0 },
    cashOuts: { type: Number, default: 0, min: 0 },
    customerRefundsCash: { type: Number, default: 0, min: 0 },
    expectedCash: { type: Number, required: true, default: 0 },
    countedCash: { type: Number },
    difference: { type: Number },
    differenceReason: { type: String, trim: true },
    status: { type: String, enum: ["open", "closed", "reopened"], default: "open", required: true, index: true },
    closedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

CashSessionSchema.index({ organizationId: 1, status: 1, userId: 1 });

export const CashSession: Model<ICashSession> =
  mongoose.models.CashSession || mongoose.model<ICashSession>("CashSession", CashSessionSchema);
