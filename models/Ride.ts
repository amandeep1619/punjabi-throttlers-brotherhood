import { Schema, model, models, Model, Document, Types } from "mongoose";

export type RideStatus = "upcoming" | "completed" | "cancelled";
export type MediaSource = "upload" | "external";
export type GalleryType = "photo" | "video";

export interface RideMedia {
  url: string;
  source: MediaSource;
}

export interface RideGalleryItem extends RideMedia {
  type: GalleryType;
}

export interface RideItineraryItem {
  day: string;
  title: string;
  description: string;
}

export interface RideDoc extends Document {
  title: string;
  description: string;
  distanceKm: number;
  startDate: Date;
  endDate?: Date;
  status: RideStatus;
  tags: string[];
  featured: boolean;
  kmAwarded: boolean;
  maxSlots?: number;
  banner: RideMedia;
  itinerary: RideItineraryItem[];
  gallery: Types.DocumentArray<RideGalleryItem>;
  enrolledMembers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RideMediaSchema = new Schema<RideMedia>(
  {
    url: { type: String, required: true },
    source: { type: String, enum: ["upload", "external"], required: true },
  },
  { _id: false }
);

const RideGalleryItemSchema = new Schema<RideGalleryItem>(
  {
    url: { type: String, required: true },
    source: { type: String, enum: ["upload", "external"], required: true },
    type: { type: String, enum: ["photo", "video"], required: true },
  },
  { _id: true }
);

const RideItinerarySchema = new Schema<RideItineraryItem>(
  {
    day: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const RideSchema = new Schema<RideDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    distanceKm: { type: Number, required: true, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming", index: true },
    tags: { type: [String], default: [], index: true },
    featured: { type: Boolean, default: false },
    kmAwarded: { type: Boolean, default: false },
    // Optional — absent/undefined means unlimited slots, no capacity UI shown.
    maxSlots: { type: Number, min: 1 },
    banner: { type: RideMediaSchema, required: true },
    itinerary: { type: [RideItinerarySchema], default: [] },
    gallery: { type: [RideGalleryItemSchema], default: [] },
    enrolledMembers: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
  },
  { timestamps: true }
);

RideSchema.index({ startDate: -1 });

export const Ride: Model<RideDoc> = models.Ride || model<RideDoc>("Ride", RideSchema);
