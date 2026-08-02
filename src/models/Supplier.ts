import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupplier extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  tradeName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  currency: string;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    tradeName: { type: String, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    taxId: { type: String, trim: true },
    currency: { type: String, default: "USD", required: true },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ organizationId: 1, name: 1 });

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema);
