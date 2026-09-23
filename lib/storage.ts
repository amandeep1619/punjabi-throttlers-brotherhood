import "server-only";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";

// ponytail: local-disk storage. Works for dev and a self-hosted VPS, but Vercel's
// filesystem is ephemeral/read-only at runtime — files written here vanish on the
// next deploy/cold start. Before a real Vercel launch, swap the two bodies below
// for an S3-compatible SDK call; every caller only ever calls saveFile/deleteFile,
// so nothing else in the app needs to change.

const UPLOAD_FOLDERS = ["members", "rides", "gallery"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

// Extension is derived from the declared MIME type, never from the client's
// filename — otherwise an attacker can upload e.g. an .html/.svg file with a
// script in it and later navigate straight to it, same-origin (stored XSS).
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

/** Thrown for a bad *upload*, as opposed to a real server error — routes should turn this into a 400. */
export class UploadError extends Error {}

export async function saveFile(file: File, folder: UploadFolder): Promise<string> {
  if (!UPLOAD_FOLDERS.includes(folder)) {
    throw new Error(`Invalid upload folder: ${folder}`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError("File is too large (max 15MB).");
  }
  // ponytail: MIME allowlist, not magic-byte sniffing — closes arbitrary
  // content-type hosting without a new dependency. Add real sniffing (e.g.
  // the `file-type` package) if this ever needs to resist a forged
  // Content-Type in a hand-crafted multipart request.
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Unsupported file type — images and videos only.");
  }

  const safeName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${safeName}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return; // external link, nothing to delete on disk
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
