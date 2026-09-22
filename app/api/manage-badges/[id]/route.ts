import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getSession } from "@/lib/auth";
import { badgeUpdateSchema } from "@/lib/validation/badge";
import { updateBadge, deleteBadge, reevaluateBadge } from "@/lib/queries/badges";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = badgeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid badge data" }, { status: 400 });
  }

  // zod's `.default()` (on `active`) fires even under `.partial()` when a
  // key is entirely absent from input — same trap as the ride edit route.
  // Only apply fields actually present in this request (e.g. the row menu's
  // Activate/Deactivate toggle sends just `{ active }` and must not also
  // silently reset `active` to its default via some other partial caller).
  const data = { ...parsed.data };
  const presentKeys = new Set(Object.keys(body ?? {}));
  for (const key of Object.keys(data) as (keyof typeof data)[]) {
    if (!presentKeys.has(key)) delete data[key];
  }

  let badge;
  try {
    badge = await updateBadge(id, data);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A badge with this name already exists" }, { status: 409 });
    }
    throw err;
  }
  if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });

  // A lowered threshold (or a badge re-activated) can newly qualify members —
  // recompute in the background rather than making the admin wait for it.
  after(() => reevaluateBadge(id));

  return NextResponse.json({ ok: true, badge });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const badge = await deleteBadge(id);
  if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
