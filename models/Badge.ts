import { Schema, model, models, Model, Document } from "mongoose";

export type BadgeCriteriaType = "RIDE_COUNT" | "TOTAL_KM";

export interface BadgeDoc extends Document {
  name: string;
  description: string;
  icon?: string;
  // Real uploaded artwork — takes priority over the letter avatar when set.
  imageUrl?: string;
  criteriaType: BadgeCriteriaType;
  // Only meaningful for RIDE_COUNT — absent/null means "any completed ride
  // counts", not "match rides with no tags".
  tag?: string;
  threshold: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<BadgeDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    // Vestigial: display now uses a letter avatar (see components/badges/BadgeAvatar.tsx)
    // — kept for when real uploaded images replace both, next month.
    icon: { type: String, trim: true },
    imageUrl: { type: String },
    criteriaType: { type: String, enum: ["RIDE_COUNT", "TOTAL_KM"], required: true },
    tag: { type: String, trim: true },
    threshold: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Badge: Model<BadgeDoc> = models.Badge || model<BadgeDoc>("Badge", BadgeSchema);
