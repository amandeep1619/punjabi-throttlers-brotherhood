import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { savePolicies } from "@/lib/queries/policies";
import { z } from "zod";

const policiesSchema = z.object({
  sections: z.array(
    z.object({
      heading: z.string().trim().min(1),
      body: z.string().trim().min(1),
      order: z.number(),
    })
  ),
});

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = policiesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid policy data" }, { status: 400 });
  }

  await savePolicies(parsed.data.sections, session.userId);
  return NextResponse.json({ ok: true });
}
