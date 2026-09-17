# Punjabi Throttlers Brotherhood

Member portal for the riding community — public site, member application/approval pipeline, ride
management with a km-tracking ledger, and an admin back office.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB/Mongoose · Zustand · JWT auth.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI, JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm run seed:admin           # creates the first admin account (only way in — no public admin signup)
npm run seed:policies        # seeds the guideline sections shown on /policies
npm run dev
```

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run seed:admin` — bootstrap the first admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env.local`)
- `npm run seed:policies` — seed initial `/policies` content (no-ops if already seeded; edit from
  `/manage-policies` afterward)

## Known limitation — file storage

`lib/storage.ts` currently writes uploads to `public/uploads/**` on local disk. This works for local dev
and a self-hosted VPS, but **will not survive a Vercel deploy** (its filesystem is ephemeral/read-only at
runtime — uploaded photos would vanish on the next deploy or cold start). Before deploying to Vercel,
swap `saveFile`/`deleteFile` in `lib/storage.ts` for an S3-compatible SDK call (S3, R2, Spaces, etc.) —
every caller only ever calls those two functions, so nothing else needs to change.

## Auth

Custom JWT (`jsonwebtoken`) in an httpOnly cookie, minimal payload (`{ userId, role }`). Route protection
is enforced in `proxy.ts` (Next 16's replacement for `middleware.ts`) and again per-page/per-route as
defense-in-depth. There is no password-reset flow yet — a locked-out member needs an admin to help.

## Not yet built (see the approved plan for full scope notes)

- Password reset / forgot-password
- Email/SMS notifications
- Cloud file storage (see above)
