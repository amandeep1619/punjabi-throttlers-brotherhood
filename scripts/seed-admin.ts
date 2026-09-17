// Bootstraps the first admin account. There is no public admin-signup route,
// so this is the only way to get an initial admin into the database.
//   npm run seed:admin
import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic imports, run only after env vars are loaded above — static imports
// get hoisted ahead of the config() call by the TS->CJS transform, which
// would make lib/db.ts read MONGODB_URI before it's set.
async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { hashPassword } = await import("../lib/password");
  const { getNextMemberId } = await import("../lib/counters");
  const { Member } = await import("../models/Member");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || "Club Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before running this script.");
  }

  await connectToDatabase();

  const existing = await Member.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists for ${email} (memberId: ${existing.memberId}, role: ${existing.role}). Nothing to do.`);
    process.exit(0);
  }

  const memberId = await getNextMemberId();
  const passwordHash = await hashPassword(password);

  const admin = await Member.create({
    memberId,
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    status: "active",
    dob: new Date("1990-01-01"),
    gender: "unspecified",
    bloodGroup: "unspecified",
    primaryMobile: "0000000000",
    country: "India",
    emergencyContact: { fullName: "N/A", relationship: "N/A", phone: "0000000000" },
    motorcycle: { make: "N/A", model: "N/A", year: new Date().getFullYear(), licensePlate: "N/A" },
    ridingExperienceYears: 0,
    inAnotherRidingGroup: false,
    totalKmWithClub: 0,
  });

  console.log(`Created admin ${admin.memberId} <${admin.email}>. Log in at /login.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
