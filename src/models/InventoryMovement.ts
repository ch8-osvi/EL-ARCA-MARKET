import mongoose, { Schema, Document, Model } from "mongoose";

export type MovementType =
  | "purchase" // Compra a proveedor
  | "sale" // Venta a cliente
  | "customer_return" // Devolución de cliente
  | "supplier_return" // Devolución a proveedor
  | "adjustment_positive" // Ajuste manual positivo
  | "adjustment_negative" // Ajuste manual negativo
  | "damaged" // Producto dañado
  | "expired" // Producto vencido
  | "internal_consumption" // Consumo interno
  | "initial_creation" // Creación inicial
  | "void_correction"; // Corrección por anulación

export interface IInventoryMovement extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: MovementType;
  quantity: number; // Positivo para incrementos, negativo para decrementos
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  referenceType?: "Sale" | "Purchase" | "Return" | "Adjustment";
  referenceId?: mongoose.Types.ObjectId;
  idempotencyKey?: string;
  reason?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "customer_return",
        "supplier_return",
        "adjustment_positive",
        "adjustment_negative",
        "damaged",
        "expired",
        "internal_consumption",
        "initial_creation",
        "void_correction",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    referenceType: { type: String, enum: ["Sale", "Purchase", "Return", "Adjustment"] },
    referenceId: { type: Schema.Types.ObjectId },
    idempotencyKey: { type: String, index: true },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryMovementSchema.index({ organizationId: 1, productId: 1, createdAt: -1 });
InventoryMovementSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const InventoryMovement: Model<IInventoryMovement> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
