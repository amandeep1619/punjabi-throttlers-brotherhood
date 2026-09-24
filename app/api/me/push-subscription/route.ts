import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { PushSubscription } from "@/models/PushSubscription";

const subscribeSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await connectToDatabase();
  // upsert on endpoint: re-subscribing the same browser (permission reset,
  // re-login) updates the existing row instead of erroring on the unique index.
  await PushSubscription.findOneAndUpdate(
    { endpoint: parsed.data.endpoint },
    { member: session.userId, endpoint: parsed.data.endpoint, keys: parsed.data.keys },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : null;
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

  await connectToDatabase();
  // Scoped to the caller's own member id — can't delete someone else's subscription by guessing an endpoint.
  await PushSubscription.deleteOne({ endpoint, member: session.userId });

  return NextResponse.json({ ok: true });
}
