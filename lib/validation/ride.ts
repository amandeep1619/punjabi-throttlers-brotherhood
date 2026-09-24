import { z } from "zod";

export const rideStatusOptions = ["upcoming", "completed", "cancelled"] as const;
export const mediaSourceOptions = ["upload", "external"] as const;
export const galleryTypeOptions = ["photo", "video"] as const;

export const rideItinerarySchema = z.object({
  day: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().default(""),
});

// Banner upload is handled via multipart FormData (separate file field);
// this schema covers the rest of the ride fields, plus an external banner URL.
export const rideFormSchema = z.object({
  title: z.string().trim().min(2, "Enter a ride title"),
  description: z.string().trim().min(1, "Enter a description"),
  distanceKm: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  // Same empty-string-to-undefined preprocess as maxSlots/budget below — an
  // <input type="date"> left blank sends "" (present, not omitted), and
  // z.coerce.date() on "" produces an Invalid Date that fails validation
  // instead of being treated as "not set". Without this, creating any
  // single-day ride (no end date) 400s.
  endDate: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.date().optional()
  ),
  status: z.enum(rideStatusOptions).default("upcoming"),
  tags: z.array(z.string().trim().min(1)).default([]),
  // Not z.coerce.boolean() — that reads ANY non-empty string as true,
  // including the literal string "false" (JS truthy coercion), which is
  // exactly the value the form's hidden-checkbox-fallback input sends.
  featured: z.preprocess((v) => v === "true" || v === true, z.boolean()).default(false),
  bannerUrl: z.string().trim().optional(), // used only when banner source is "external"
  // Optional ride capacity — blank input means unlimited, not zero.
  maxSlots: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().positive().optional()
  ),
  // Optional — blank input means "not tracked", rendered as N/A, not ₹0.
  budget: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
});

export type RideFormInput = z.infer<typeof rideFormSchema>;

export const galleryExternalSchema = z.object({
  url: z.url("Enter a valid URL"),
  type: z.enum(galleryTypeOptions),
});
