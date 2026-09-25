import { z } from "zod";

export const badgeCriteriaTypes = ["RIDE_COUNT", "TOTAL_KM"] as const;

// Plain object (no .refine()) so it can still be .partial()'d for updates —
// zod v4 disallows .partial() on a schema that already carries a refinement.
const badgeObjectSchema = z.object({
  name: z.string().trim().min(2, "Enter a badge name").max(60),
  description: z.string().trim().min(3, "Enter a description").max(200),
  // Vestigial: badges display as a letter avatar (first char of the name)
  // for now, not this icon — kept around for when real uploaded images
  // replace both next month, so it's optional rather than required.
  icon: z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.string().trim().max(4).optional()),
  criteriaType: z.enum(badgeCriteriaTypes),
  tag: z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.string().trim().max(40).optional()),
  threshold: z.coerce.number().int().min(1, "Threshold must be at least 1"),
  active: z.preprocess((v) => v === "true" || v === true, z.boolean()).default(true),
});

const tagOnlyForRideCount = {
  message: "Tag only applies to ride-count badges",
  path: ["tag"],
};

// Full validation, used on create — both fields are always present, so the
// cross-field rule can run.
export const badgeSchema = badgeObjectSchema.refine(
  (data) => data.criteriaType !== "TOTAL_KM" || !data.tag,
  tagOnlyForRideCount
);

// Used on update (e.g. the admin table's Activate/Deactivate toggle sends
// only `{ active }`) — no cross-field refinement, since a partial payload
// may not carry both criteriaType and tag to check against each other.
export const badgeUpdateSchema = badgeObjectSchema.partial();

export type BadgeInput = z.infer<typeof badgeSchema>;
