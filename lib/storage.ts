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

export async function saveFile(buffer: Buffer, folder: UploadFolder, originalFilename: string): Promise<string> {
  if (!UPLOAD_FOLDERS.includes(folder)) {
    throw new Error(`Invalid upload folder: ${folder}`);
  }
  // Never trust the client's filename beyond its extension — path is fully server-generated.
  const ext = path.extname(originalFilename).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  const safeName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);
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
