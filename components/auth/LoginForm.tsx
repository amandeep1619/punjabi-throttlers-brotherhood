"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation/member";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

type LoginFormValues = LoginInput;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        return;
      }
      // Hard navigation, not router.push()+refresh(): the root layout reads
      // the session cookie to build the navbar's user (and its admin link),
      // and a client-side transition can render it before that layout has
      // re-fetched with the just-set cookie — showing a stale, logged-out-
      // looking navbar until a manual refresh. A full reload always re-runs
      // the root layout against the fresh cookie, so there's no window for that.
      window.location.href = searchParams.get("next") || "/";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {serverError}
        </p>
      )}

      <div>
        <label className="block text-sm text-pt-muted mb-1.5">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-pt-cream focus:outline-none focus:border-pt-gold"
        />
        {errors.email && <p className="text-xs text-red-300 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm text-pt-muted mb-1.5">Password</label>
        <PasswordInput {...register("password")} />
        {errors.password && <p className="text-xs text-red-300 mt-1">{errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Login"}
      </Button>
    </form>
  );
}
