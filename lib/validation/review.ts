import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Pick a star rating").max(5),
  text: z.string().trim().min(3, "Say a little more about the ride"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
