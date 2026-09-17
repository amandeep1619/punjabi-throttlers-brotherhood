import { Counter } from "@/models/Counter";

// Atomic $inc, not count-then-add-one — safe under concurrent /join submissions.
// Gaps from a failed downstream step are accepted, never reclaimed.
export async function getNextMemberId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: "memberId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return "PT" + String(counter.seq).padStart(3, "0");
}
