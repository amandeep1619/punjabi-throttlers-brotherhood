import { z } from "zod";

export const genderOptions = ["Male", "Female", "Other"] as const;
export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

// /join — everything the public form collects. `totalKmWithClub` is
// deliberately absent: it's server-set to 0 and never accepted from the client.
export const joinSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  dob: z.coerce.date({ error: "Enter your date of birth" }),
  gender: z.enum(genderOptions),
  bloodGroup: z.enum(bloodGroupOptions),
  primaryMobile: z.string().trim().min(7, "Enter a valid mobile number"),
  country: z.string().trim().min(2, "Enter your country"),

  emergencyFullName: z.string().trim().min(2, "Enter emergency contact name"),
  emergencyRelationship: z.string().trim().min(2, "Enter relationship"),
  emergencyPhone: z.string().trim().min(7, "Enter a valid phone number"),

  make: z.string().trim().min(1, "Enter the bike make"),
  model: z.string().trim().min(1, "Enter the bike model"),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  licensePlate: z.string().trim().min(3, "Enter the license plate number"),

  ridingExperienceYears: z.coerce.number().min(0).max(80),
  inAnotherRidingGroup: z.coerce.boolean().default(false),
});

export type JoinInput = z.output<typeof joinSchema>;
export type JoinFormInput = z.input<typeof joinSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// /me — self-edit. memberId, email, status, role, totalKmWithClub are never editable here.
export const meUpdateSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  primaryMobile: z.string().trim().min(7).optional(),
  secondaryMobile: z.string().trim().optional(),
  location: z.string().trim().optional(),
  permanentAddress: z.string().trim().optional(),
  make: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().trim().min(3).optional(),
});

export type MeUpdateInput = z.output<typeof meUpdateSchema>;
export type MeUpdateFormInput = z.input<typeof meUpdateSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Re-enter the new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
