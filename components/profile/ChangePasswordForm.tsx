"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation/member";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/useUiStore";

const labelClass = "block text-sm text-pt-muted mb-1.5";

export default function ChangePasswordForm() {
  const showToast = useUiStore((s) => s.showToast);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Could not change password", "error");
        return;
      }
      showToast("Password updated", "success");
      reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      <div>
        <label className={labelClass}>Current Password</label>
        <PasswordInput {...register("currentPassword")} />
        {errors.currentPassword && <p className="text-xs text-red-300 mt-1">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <label className={labelClass}>New Password</label>
        <PasswordInput {...register("newPassword")} />
        {errors.newPassword && <p className="text-xs text-red-300 mt-1">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Confirm New Password</label>
        <PasswordInput {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-red-300 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
