"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  joinSchema,
  type JoinInput,
  type JoinFormInput,
  genderOptions,
  bloodGroupOptions,
} from "@/lib/validation/member";
import { JOIN_STEPS, useJoinWizardStore } from "@/store/useJoinWizardStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";

const STEP_FIELDS: (keyof JoinFormInput)[][] = [
  ["fullName", "email", "password", "dob", "gender", "bloodGroup", "primaryMobile", "country"],
  ["emergencyFullName", "emergencyRelationship", "emergencyPhone"],
  ["make", "model", "year", "licensePlate"],
  ["ridingExperienceYears", "inAnotherRidingGroup"],
];

const inputClass =
  "w-full rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2.5 text-pt-cream focus:outline-none focus:border-pt-gold";
const labelClass = "block text-sm text-pt-muted mb-1.5";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </div>
  );
}

export default function JoinForm() {
  const step = useJoinWizardStore((s) => s.step);
  const next = useJoinWizardStore((s) => s.next);
  const back = useJoinWizardStore((s) => s.back);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<JoinFormInput, unknown, JoinInput>({
    resolver: zodResolver(joinSchema),
    defaultValues: { inAnotherRidingGroup: false },
  });

  async function handleNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) next();
  }

  async function onSubmit(values: JoinInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      });
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch("/api/join", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccessId(data.memberId);
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL;
    return (
      <Card className="p-10 text-center">
        <p className="text-pt-gold text-sm uppercase tracking-widest mb-3">Application received</p>
        <h2 className="text-2xl font-semibold text-pt-cream mb-3">Thank you for your registration, {successId}</h2>
        <p className="text-pt-muted max-w-md mx-auto">
          Your account will be reviewed and approved shortly. Click the link below to join our WhatsApp group.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 rounded-full bg-pt-gold px-6 py-3 text-sm font-medium text-pt-black hover:bg-pt-gold-bright"
          >
            Join our WhatsApp group
          </a>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-10">
      <ol className="flex flex-wrap gap-2 mb-10">
        {JOIN_STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 min-w-[120px] text-center text-xs font-medium uppercase tracking-wide py-2 rounded-full border ${
              i === step
                ? "border-pt-gold text-pt-gold bg-pt-gold/10"
                : i < step
                  ? "border-pt-gold/40 text-pt-gold/70"
                  : "border-pt-border text-pt-muted"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {serverError && (
        <p className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {serverError}
        </p>
      )}

      <form
        onSubmit={(e) => {
          // Enter-key in a text field submits the nearest form natively —
          // without this guard that would call the real onSubmit (and its
          // schema-wide validation) from any intermediate step, same
          // premature-submit risk as the button race above. Treat it as
          // "advance one step" instead, exactly like clicking Next.
          if (step < JOIN_STEPS.length - 1) {
            e.preventDefault();
            handleNext();
            return;
          }
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
      >
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="text-sm text-pt-muted file:mr-4 file:rounded-full file:border-0 file:bg-pt-gold file:text-pt-black file:px-4 file:py-2 file:text-sm file:font-medium"
              />
            </div>
            <Field label="Full Name" error={errors.fullName?.message}>
              <input {...register("fullName")} className={inputClass} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" {...register("email")} className={inputClass} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <PasswordInput {...register("password")} />
            </Field>
            <Field label="Date of Birth" error={errors.dob?.message}>
              <input type="date" {...register("dob")} className={inputClass} />
            </Field>
            <Field label="Gender" error={errors.gender?.message}>
              <select {...register("gender")} className={inputClass}>
                <option value="">Select</option>
                {genderOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Blood Group" error={errors.bloodGroup?.message}>
              <select {...register("bloodGroup")} className={inputClass}>
                <option value="">Select</option>
                {bloodGroupOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mobile Number" error={errors.primaryMobile?.message}>
              <input {...register("primaryMobile")} className={inputClass} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <input {...register("country")} className={inputClass} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name" error={errors.emergencyFullName?.message}>
              <input {...register("emergencyFullName")} className={inputClass} />
            </Field>
            <Field label="Relationship" error={errors.emergencyRelationship?.message}>
              <input {...register("emergencyRelationship")} className={inputClass} />
            </Field>
            <Field label="Phone Number" error={errors.emergencyPhone?.message}>
              <input {...register("emergencyPhone")} className={inputClass} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Make" error={errors.make?.message}>
              <input placeholder="Royal Enfield" {...register("make")} className={inputClass} />
            </Field>
            <Field label="Model" error={errors.model?.message}>
              <input placeholder="Meteor 350" {...register("model")} className={inputClass} />
            </Field>
            <Field label="Year" error={errors.year?.message}>
              <input type="number" {...register("year")} className={inputClass} />
            </Field>
            <Field label="License Plate Number" error={errors.licensePlate?.message}>
              <input placeholder="PB03ARXXXXX" {...register("licensePlate")} className={inputClass} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Total Riding Experience (years)" error={errors.ridingExperienceYears?.message}>
              <input type="number" step="0.5" {...register("ridingExperienceYears")} className={inputClass} />
            </Field>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="inAnotherRidingGroup" {...register("inAnotherRidingGroup")} className="h-4 w-4 accent-pt-gold" />
              <label htmlFor="inAnotherRidingGroup" className="text-sm text-pt-cream">
                Are you part of another riding group?
              </label>
            </div>
          </div>
        )}

        <p className="text-xs text-pt-muted">
          By joining you agree with our{" "}
          <Link href="/policies" className="text-pt-gold hover:underline">
            policies
          </Link>
          .
        </p>

        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
            Back
          </Button>
          {/* Always the same type="button" element (never swapped for a
              type="submit" one at this exact spot) — a real native submit
              button appearing here at the moment "Next" is clicked lets a
              single physical click's mousedown/mouseup straddle the
              re-render and land on the new button, submitting the whole
              application a step early with defaulted-blank fields. Confirmed
              reproducible; onClick now always decides explicitly instead. */}
          <Button
            type="button"
            onClick={step < JOIN_STEPS.length - 1 ? handleNext : handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {step < JOIN_STEPS.length - 1 ? "Next" : submitting ? "Submitting…" : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
