import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  organizationId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  businessName: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  timeZone: string;
  currency: string; // e.g. USD, MXN, ARS
  currencySymbol: string; // e.g. $
  decimalPlaces: number;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  businessStartHour: number; // e.g. 8 (08:00 AM)
  requireCashSessionForSales: boolean;
  requireAdjustmentReason: boolean;
  requireAIConfirmation: boolean;
  enableTax: boolean;
  taxRate: number;
  receiptHeader?: string;
  receiptFooter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    businessName: { type: String, default: "El Arca Market", required: true },
    logoUrl: { type: String },
    phone: { type: String, default: "+1 800 555 0199" },
    address: { type: String, default: "Av. Principal #100" },
    timeZone: { type: String, default: "America/Mexico_City" },
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    decimalPlaces: { type: Number, default: 2 },
    allowNegativeStock: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    businessStartHour: { type: Number, default: 6 },
    requireCashSessionForSales: { type: Boolean, default: true },
    requireAdjustmentReason: { type: Boolean, default: true },
    requireAIConfirmation: { type: Boolean, default: true },
    enableTax: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    receiptHeader: { type: String, default: "¡Gracias por su compra en El Arca Market!" },
    receiptFooter: { type: String, default: "Vuelva pronto" },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
