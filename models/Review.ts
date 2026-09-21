import { Schema, model, models, Model, Document, Types } from "mongoose";

export interface ReviewDoc extends Document {
  ride: Types.ObjectId;
  member: Types.ObjectId;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    ride: { type: Schema.Types.ObjectId, ref: "Ride", required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// One review per member per ride — a resubmission updates it instead of duplicating.
ReviewSchema.index({ ride: 1, member: 1 }, { unique: true });

export const Review: Model<ReviewDoc> = models.Review || model<ReviewDoc>("Review", ReviewSchema);
