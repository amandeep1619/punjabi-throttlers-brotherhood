import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Policy, POLICY_DOC_ID, type PolicySection } from "@/models/Policy";

export async function getPolicies() {
  await connectToDatabase();
  const doc = await Policy.findById(POLICY_DOC_ID).lean();
  return doc?.sections ?? [];
}

export async function savePolicies(sections: PolicySection[], updatedBy: string) {
  await connectToDatabase();
  return Policy.findByIdAndUpdate(
    POLICY_DOC_ID,
    { sections, updatedBy },
    { upsert: true, returnDocument: "after" }
  );
}
