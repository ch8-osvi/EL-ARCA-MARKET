import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  barcode?: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // Costo histórico al momento de la venta
  discount: number;
  subtotal: number;
  total: number;
  promotionId?: mongoose.Types.ObjectId;
}

export interface IPayment {
  method: "cash" | "card" | "transfer" | "other";
  amount: number;
  reference?: string;
}

export interface ISale extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  receiptNumber: string; // ej. REC-20260802-0001
  cashSessionId?: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  customerName?: string;
  items: ISaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  totalCost: number; // Suma del costo de mercancía vendida
  grossProfit: number; // total - totalCost
  payments: IPayment[];
  cashReceived?: number;
  changeGiven?: number;
  currency: string;
  exchangeRate: number;
  status: "completed" | "voided" | "refunded";
  voidReason?: string;
  voidedBy?: mongoose.Types.ObjectId;
  voidedAt?: Date;
  idempotencyKey: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    barcode: { type: String },
    name: { type: String, required: true },
    unit: { type: String, default: "unidad" },
    quantity: { type: Number, required: true, min: 0.001 },
    unitPrice: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    method: { type: String, enum: ["cash", "card", "transfer", "other"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String, trim: true },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    receiptNumber: { type: String, required: true, index: true },
    cashSessionId: { type: Schema.Types.ObjectId, ref: "CashSession", index: true },
    cashierId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, default: "Cliente General" },
    items: [SaleItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    grossProfit: { type: Number, required: true },
    payments: [PaymentSchema],
    cashReceived: { type: Number, default: 0 },
    changeGiven: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    exchangeRate: { type: Number, default: 1.0 },
    status: { type: String, enum: ["completed", "voided", "refunded"], default: "completed", required: true, index: true },
    voidReason: { type: String },
    voidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    voidedAt: { type: Date },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ organizationId: 1, createdAt: -1 });
SaleSchema.index({ storeId: 1, createdAt: -1 });
SaleSchema.index({ cashierId: 1, createdAt: -1 });

export const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
