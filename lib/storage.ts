import "server-only";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// S3-backed storage. Every caller only ever calls saveFile/deleteFile, so this
// is the one place that knows about buckets/keys — see DEPLOYMENT.md for the
// bucket policy + IAM setup this expects.

const UPLOAD_FOLDERS = ["members", "rides", "gallery"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB

// Extension is derived from the declared MIME type, never from the client's
// filename — otherwise an attacker can upload e.g. an .html/.svg file with a
// script in it and later navigate straight to it, same-origin (stored XSS).
//
// Images only, no video — S3 egress is billed per-GB with no bundled
// allowance (unlike Lightsail's instance transfer), so video would blow the
// budget fast. Videos stay external links only (YouTube/Drive/Instagram);
// enforced here, not just in the upload form, so it holds even against a
// hand-crafted request.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** Thrown for a bad *upload*, as opposed to a real server error — routes should turn this into a 400. */
export class UploadError extends Error {}

// Lazy: routes that import this module don't all necessarily call saveFile
// (e.g. the gallery route's external-video-link branch never touches S3), so
// this must not throw at import time — only when an actual upload is
// attempted. A module-level throw here previously took down that entire
// route, including the branch that needs zero AWS config.
let s3Client: S3Client | null = null;
function getS3() {
  if (s3Client) return s3Client;
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) {
    throw new Error("AWS_S3_BUCKET and AWS_REGION must be set in the environment");
  }
  // Picks up AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY from the environment automatically.
  s3Client = new S3Client({ region });
  return s3Client;
}

function publicBaseUrl(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  // Override with a CloudFront/custom domain later; defaults to the bucket's
  // own virtual-hosted-style URL, which is all a ₹1000/month setup needs on day one.
  return (process.env.AWS_S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`).replace(/\/$/, "");
}

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
    throw new UploadError("Unsupported file type — only photos (JPEG, PNG, WEBP, GIF) can be uploaded.");
  }

  const s3 = getS3();
  const key = `${folder}/${randomUUID()}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      // Random UUID keys never change content, so cache forever — cuts repeat
      // S3 GET/transfer costs, the main lever on a tight budget.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${publicBaseUrl()}/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  const base = publicBaseUrl();
  if (!url.startsWith(base + "/")) return; // external link, not ours to delete
  const key = url.slice(base.length + 1);
  await getS3()
    .send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }))
    .catch(() => {});
}
