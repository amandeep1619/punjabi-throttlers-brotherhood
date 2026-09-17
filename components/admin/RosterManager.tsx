"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

type RosterMember = {
  _id: string;
  memberId: string;
  fullName: string;
  bloodGroup: string;
  location?: string;
  motorcycle: { licensePlate: string; make: string; model: string };
  primaryMobile: string;
};

export function RosterManager({
  rideId,
  initialMembers,
  locked,
}: {
  rideId: string;
  initialMembers: RosterMember[];
  locked: boolean;
}) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [members, setMembers] = useState(initialMembers);
  const [memberIdInput, setMemberIdInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!memberIdInput.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/manage-rides/${rideId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: memberIdInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not add member", "error");
        return;
      }
      setMemberIdInput("");
      showToast("Member added", "success");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(memberId: string) {
    const res = await fetch(`/api/manage-rides/${rideId}/members/${memberId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.error ?? "Could not remove member", "error");
      return;
    }
    setMembers((prev) => prev.filter((m) => m._id !== memberId));
    showToast("Member removed", "success");
  }

  return (
    <div>
      {!locked && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            value={memberIdInput}
            onChange={(e) => setMemberIdInput(e.target.value)}
            placeholder="Enter member ID (e.g. PT004)"
            className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2 text-sm text-pt-cream flex-1"
          />
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Adding…" : "Add Rider"}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-pt-border">
        <table className="w-full text-sm">
          <thead className="bg-pt-black-soft text-pt-muted text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name (PT No.)</th>
              <th className="px-4 py-2.5 font-medium">Blood Group</th>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Bike</th>
              <th className="px-4 py-2.5 font-medium">Mobile</th>
              {!locked && <th className="px-4 py-2.5 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-t border-pt-border/60">
                <td className="px-4 py-2.5">
                  <Link href={`/members/${m._id}`} className="text-pt-cream hover:text-pt-gold">
                    {m.fullName} ({m.memberId})
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-pt-muted">{m.bloodGroup}</td>
                <td className="px-4 py-2.5 text-pt-muted">{m.location ?? "-"}</td>
                <td className="px-4 py-2.5 text-pt-muted">
                  {m.motorcycle.make} {m.motorcycle.model} · {m.motorcycle.licensePlate}
                </td>
                <td className="px-4 py-2.5 text-pt-muted">{m.primaryMobile}</td>
                {!locked && (
                  <td className="px-4 py-2.5">
                    <button onClick={() => handleRemove(m._id)} className="text-red-300 hover:text-red-200 text-xs">
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pt-muted">
                  No riders enrolled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
