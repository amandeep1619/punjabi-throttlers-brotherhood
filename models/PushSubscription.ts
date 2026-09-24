import { Schema, model, models, Model, Document, Types } from "mongoose";

// One row per browser/device a member has enabled notifications on — a
// member can have several (phone + laptop), each gets pushed to separately.
export interface PushSubscriptionDoc extends Document {
  member: Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDoc>({
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

// Re-subscribing the same browser (e.g. after clearing permission) updates
// the same row instead of piling up duplicates for one device.
PushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

export const PushSubscription: Model<PushSubscriptionDoc> =
  models.PushSubscription || model<PushSubscriptionDoc>("PushSubscription", PushSubscriptionSchema);
