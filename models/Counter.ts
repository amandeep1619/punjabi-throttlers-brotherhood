import { Schema, model, models } from "mongoose";

export interface CounterDoc {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = models.Counter || model<CounterDoc>("Counter", CounterSchema);
