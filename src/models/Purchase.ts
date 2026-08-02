import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  lotNumber?: string;
  expirationDate?: Date;
}

export interface IPurchase extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  referenceNumber: string;
  purchaseDate: Date;
  items: IPurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  exchangeRate: number;
  status: "draft" | "received" | "cancelled";
  receiptImageUrl?: string;
  notes?: string;
  idempotencyKey?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    lotNumber: { type: String },
    expirationDate: { type: Date },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    referenceNumber: { type: String, required: true, trim: true },
    purchaseDate: { type: Date, default: Date.now, required: true },
    items: [PurchaseItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    exchangeRate: { type: Number, default: 1.0 },
    status: { type: String, enum: ["draft", "received", "cancelled"], default: "received", required: true },
    receiptImageUrl: { type: String },
    notes: { type: String },
    idempotencyKey: { type: String, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PurchaseSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
PurchaseSchema.index({ organizationId: 1, purchaseDate: -1 });

export const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);
