import { Schema, model, models, Model, Document, Types } from "mongoose";

export interface PolicySection {
  heading: string;
  body: string;
  order: number;
}

export interface PolicyDoc extends Document {
  sections: PolicySection[];
  updatedAt: Date;
  updatedBy?: Types.ObjectId;
}

const PolicySectionSchema = new Schema<PolicySection>(
  {
    heading: { type: String, required: true },
    body: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const PolicySchema = new Schema<PolicyDoc>(
  {
    // Mongoose's Document type always types _id as ObjectId; this doc uses a
    // fixed string id ("site-policies") instead, hence the cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: { type: String, required: true } as any,
    sections: { type: [PolicySectionSchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const POLICY_DOC_ID = "site-policies";

export const Policy: Model<PolicyDoc> = models.Policy || model<PolicyDoc>("Policy", PolicySchema);
