import mongoose, { Schema, Document, Model } from "mongoose";

export type PromotionType =
  | "fixed_package" // Combo o paquete a precio fijo (ej. Paquete 6 refrescos $5)
  | "percentage_discount" // Descuento porcentual (ej. 10% de descuento)
  | "buy_x_get_y" // Compra X y lleva Y gratis o con descuento
  | "volume_discount"; // Descuento por cantidad

export interface IPromotionItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IPromotion extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: PromotionType;
  participatingProducts: IPromotionItem[];
  discountValue: number; // Porcentaje o precio fijo del combo
  startDate: Date;
  endDate: Date;
  active: boolean;
  priority: number;
  combinable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionItemSchema = new Schema<IPromotionItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PromotionSchema = new Schema<IPromotion>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["fixed_package", "percentage_discount", "buy_x_get_y", "volume_discount"],
      required: true,
    },
    participatingProducts: [PromotionItemSchema],
    discountValue: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 1 },
    combinable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Promotion: Model<IPromotion> =
  mongoose.models.Promotion || mongoose.model<IPromotion>("Promotion", PromotionSchema);
