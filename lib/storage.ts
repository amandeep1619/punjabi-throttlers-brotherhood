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

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;
if (!BUCKET || !REGION) {
  throw new Error("AWS_S3_BUCKET and AWS_REGION must be set in the environment");
}

// Picks up AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY from the environment automatically.
const s3 = new S3Client({ region: REGION });

// Override with a CloudFront/custom domain later; defaults to the bucket's own
// virtual-hosted-style URL, which is all a €1000/month setup needs on day one.
const PUBLIC_BASE_URL = (process.env.AWS_S3_PUBLIC_URL || `https://${BUCKET}.s3.${REGION}.amazonaws.com`).replace(
  /\/$/,
  ""
);

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

  const key = `${folder}/${randomUUID()}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      // Random UUID keys never change content, so cache forever — cuts repeat
      // S3 GET/transfer costs, the main lever on a tight budget.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${PUBLIC_BASE_URL}/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith(PUBLIC_BASE_URL + "/")) return; // external link, not ours to delete
  const key = url.slice(PUBLIC_BASE_URL.length + 1);
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {});
}
