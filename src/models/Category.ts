import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: "tag" },
    color: { type: String, default: "#16a34a" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
