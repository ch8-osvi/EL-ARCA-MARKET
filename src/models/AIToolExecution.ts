import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIToolExecution extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  conversationId?: string;
  toolName: string;
  parameters: Record<string, any>;
  durationMs: number;
  status: "success" | "error";
  recordCount?: number;
  errorMessage?: string;
  confirmedAction: boolean;
  createdAt: Date;
}

const AIToolExecutionSchema = new Schema<IAIToolExecution>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    conversationId: { type: String, index: true },
    toolName: { type: String, required: true, index: true },
    parameters: { type: Schema.Types.Mixed },
    durationMs: { type: Number, required: true },
    status: { type: String, enum: ["success", "error"], required: true },
    recordCount: { type: Number, default: 0 },
    errorMessage: { type: String },
    confirmedAction: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AIToolExecutionSchema.index({ organizationId: 1, createdAt: -1 });

export const AIToolExecution: Model<IAIToolExecution> =
  mongoose.models.AIToolExecution ||
  mongoose.model<IAIToolExecution>("AIToolExecution", AIToolExecutionSchema);
