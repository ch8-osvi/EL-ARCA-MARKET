import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  cashSessionId?: mongoose.Types.ObjectId;
  category: string; // ej. "transporte", "electricidad", "alquiler", "reparaciones", "insumos", "alimentacion", "servicios", "otros"
  description: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  paymentMethod: "cash" | "card" | "transfer" | "other";
  fromCashRegister: boolean;
  receiptUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    cashSessionId: { type: Schema.Types.ObjectId, ref: "CashSession", index: true },
    category: { type: String, required: true, trim: true, default: "otros" },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "USD" },
    exchangeRate: { type: Number, default: 1.0 },
    paymentMethod: { type: String, enum: ["cash", "card", "transfer", "other"], default: "cash" },
    fromCashRegister: { type: Boolean, default: true },
    receiptUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ organizationId: 1, createdAt: -1 });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
