import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICashMovement extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  cashSessionId: mongoose.Types.ObjectId;
  type: "in" | "out";
  amount: number;
  reason: string;
  category?: string; // ej. "cambio", "pago_flete", "retiro_seguridad"
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CashMovementSchema = new Schema<ICashMovement>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    cashSessionId: { type: Schema.Types.ObjectId, ref: "CashSession", required: true, index: true },
    type: { type: String, enum: ["in", "out"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    reason: { type: String, required: true, trim: true },
    category: { type: String, default: "general", trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CashMovement: Model<ICashMovement> =
  mongoose.models.CashMovement || mongoose.model<ICashMovement>("CashMovement", CashMovementSchema);
