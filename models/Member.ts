import { Schema, model, models, Model, Document } from "mongoose";

export type MemberRole = "member" | "admin";
export type MemberStatus = "pending" | "active" | "banned";

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface MotorcycleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface MemberDoc extends Document {
  memberId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: MemberRole;
  status: MemberStatus;
  photoUrl?: string;
  dob: Date;
  gender: string;
  bloodGroup: string;
  primaryMobile: string;
  secondaryMobile?: string;
  country: string;
  location?: string;
  permanentAddress?: string;
  emergencyContact: EmergencyContact;
  motorcycle: MotorcycleInfo;
  ridingExperienceYears: number;
  inAnotherRidingGroup: boolean;
  totalKmWithClub: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<EmergencyContact>(
  {
    fullName: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const MotorcycleInfoSchema = new Schema<MotorcycleInfo>(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true },
  },
  { _id: false }
);

const MemberSchema = new Schema<MemberDoc>(
  {
    memberId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    status: { type: String, enum: ["pending", "active", "banned"], default: "pending", index: true },
    photoUrl: { type: String },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    primaryMobile: { type: String, required: true },
    secondaryMobile: { type: String },
    country: { type: String, required: true },
    location: { type: String },
    permanentAddress: { type: String },
    emergencyContact: { type: EmergencyContactSchema, required: true },
    motorcycle: { type: MotorcycleInfoSchema, required: true },
    ridingExperienceYears: { type: Number, required: true, default: 0 },
    inAnotherRidingGroup: { type: Boolean, default: false },
    totalKmWithClub: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MemberSchema.index({ totalKmWithClub: -1 });
MemberSchema.index({ fullName: 1 });

export const Member: Model<MemberDoc> = models.Member || model<MemberDoc>("Member", MemberSchema);
