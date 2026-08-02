import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReturnItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalRefund: number;
  returnToInventory: boolean;
  itemCondition: "good" | "damaged" | "expired";
}

export interface IReturn extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  receiptNumber: string;
  cashSessionId?: mongoose.Types.ObjectId;
  items: IReturnItem[];
  totalRefund: number;
  refundMethod: "cash" | "card" | "transfer" | "other";
  reason: string;
  processedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.001 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalRefund: { type: Number, required: true, min: 0 },
    returnToInventory: { type: Boolean, default: true },
    itemCondition: { type: String, enum: ["good", "damaged", "expired"], default: "good" },
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true },
    receiptNumber: { type: String, required: true },
    cashSessionId: { type: Schema.Types.ObjectId, ref: "CashSession", index: true },
    items: [ReturnItemSchema],
    totalRefund: { type: Number, required: true, min: 0 },
    refundMethod: { type: String, enum: ["cash", "card", "transfer", "other"], default: "cash" },
    reason: { type: String, required: true, trim: true },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Return: Model<IReturn> =
  mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);
