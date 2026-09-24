import { Schema, model, models } from "mongoose";

// One document per named daily job (currently just "birthday"), tracking the
// last date it ran — the persisted idempotency guard for the in-process
// scheduler, same role reviewReminderSent/kmAwarded play elsewhere.
// Not typed via Document (like Counter.ts) — a string _id conflicts with
// Document's default ObjectId typing.
export interface NotificationLogDoc {
  _id: string;
  lastSentDate: string; // "YYYY-MM-DD", always IST
}

const NotificationLogSchema = new Schema<NotificationLogDoc>({
  _id: { type: String, required: true },
  lastSentDate: { type: String, required: true },
});

export const NotificationLog =
  models.NotificationLog || model<NotificationLogDoc>("NotificationLog", NotificationLogSchema);
