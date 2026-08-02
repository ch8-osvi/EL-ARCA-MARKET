import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStore extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StoreSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export const Store: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);
