import mongoose, { Schema, Document, Model } from "mongoose";

export type ControlType = "simple" | "lot" | "expiration" | "serial" | "service";

export interface IProduct extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  sku: string;
  barcode?: string;
  name: string;
  shortName?: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  unit: string; // e.g. "unidad", "kg", "caja", "paquete", "litro"
  imageUrl?: string;
  cost: number; // Costo actual de compra
  price: number; // Precio de venta actual
  stock: number; // Stock actual calculado
  minStock: number; // Umbral de alerta de inventario bajo
  maxStock?: number;
  controlType: ControlType;
  allowNegativeStock: boolean;
  active: boolean;
  supplierId?: mongoose.Types.ObjectId;
  tags?: string[];
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    sku: { type: String, required: true, uppercase: true, trim: true },
    barcode: { type: String, uppercase: true, trim: true, sparse: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: String, trim: true },
    unit: { type: String, default: "unidad", required: true },
    imageUrl: { type: String },
    cost: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 5 },
    maxStock: { type: Number },
    controlType: {
      type: String,
      enum: ["simple", "lot", "expiration", "serial", "service"],
      default: "simple",
      required: true,
    },
    allowNegativeStock: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", index: true },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProductSchema.index({ organizationId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ organizationId: 1, barcode: 1 });
ProductSchema.index({ organizationId: 1, name: "text", barcode: "text", sku: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
