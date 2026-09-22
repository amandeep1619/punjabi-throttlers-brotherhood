import { Schema, model, models, Model, Document, Types } from "mongoose";

export interface MemberBadgeDoc extends Document {
  member: Types.ObjectId;
  badge: Types.ObjectId;
  awardedAt: Date;
}

const MemberBadgeSchema = new Schema<MemberBadgeDoc>({
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
  awardedAt: { type: Date, default: Date.now },
});

// A member earns a given badge at most once — re-evaluation is always safe to re-run.
MemberBadgeSchema.index({ member: 1, badge: 1 }, { unique: true });

export const MemberBadge: Model<MemberBadgeDoc> =
  models.MemberBadge || model<MemberBadgeDoc>("MemberBadge", MemberBadgeSchema);
