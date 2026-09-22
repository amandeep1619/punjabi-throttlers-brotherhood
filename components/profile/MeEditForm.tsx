"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { meUpdateSchema, type MeUpdateInput, type MeUpdateFormInput } from "@/lib/validation/member";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

const inputClass =
  "w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-pt-cream focus:outline-none focus:border-pt-gold";
const labelClass = "block text-sm text-pt-muted mb-1.5";

export default function MeEditForm({ defaults }: { defaults: MeUpdateInput }) {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<MeUpdateFormInput, unknown, MeUpdateInput>({
    resolver: zodResolver(meUpdateSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: MeUpdateInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not save changes", "error");
        return;
      }
      showToast("Profile updated", "success");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Full Name</label>
          <input {...register("fullName")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Current Location</label>
          <input {...register("location")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Primary Mobile</label>
          <input {...register("primaryMobile")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Secondary Mobile</label>
          <input {...register("secondaryMobile")} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Permanent Address</label>
          <textarea {...register("permanentAddress")} rows={2} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-pt-border">
        <div className="sm:col-span-2 pt-4">
          <p className="text-sm font-medium text-pt-cream">Bike Information</p>
        </div>
        <div>
          <label className={labelClass}>Make</label>
          <input {...register("make")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <input {...register("model")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input type="number" {...register("year")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>License Plate</label>
          <input {...register("licensePlate")} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-pt-border">
        <div className="sm:col-span-2 pt-4">
          <p className="text-sm font-medium text-pt-cream">Emergency Contact</p>
        </div>
        <div>
          <label className={labelClass}>Full Name</label>
          <input {...register("emergencyFullName")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Relationship</label>
          <input {...register("emergencyRelationship")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input {...register("emergencyPhone")} className={inputClass} />
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
