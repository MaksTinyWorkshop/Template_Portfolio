import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const PUBLIC_IMAGES_ROOT = path.resolve(process.cwd(), "public", "images");

const MIME_BY_EXTENSION: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const resolveAssetPath = (segments: string[] | undefined) => {
  if (!segments || segments.length === 0) {
    return null;
  }

  const decoded = segments.map((segment) => decodeURIComponent(segment));
  const absolutePath = path.resolve(PUBLIC_IMAGES_ROOT, ...decoded);

  // Prevent path traversal outside /public/images
  if (
    absolutePath !== PUBLIC_IMAGES_ROOT &&
    !absolutePath.startsWith(`${PUBLIC_IMAGES_ROOT}${path.sep}`)
  ) {
    return null;
  }

  return absolutePath;
};

const buildETag = (size: number, mtimeMs: number) => `W/"${size}-${Math.floor(mtimeMs)}"`;

const buildHeaders = (filePath: string, size: number, mtimeMs: number) => {
  const extension = path.extname(filePath).toLowerCase();
  const etag = buildETag(size, mtimeMs);
  return {
    "Content-Type": MIME_BY_EXTENSION[extension] ?? "application/octet-stream",
    "Content-Length": String(size),
    // Important: assets can be overwritten with the same filename (custom name, no timestamp).
    // Make browsers revalidate so uploads are visible immediately in production.
    "Cache-Control": "public, max-age=0, must-revalidate",
    ETag: etag,
    "Last-Modified": new Date(mtimeMs).toUTCString(),
    "X-Content-Type-Options": "nosniff",
  };
};

const safeStat = async (filePath: string) => stat(filePath).catch(() => null);
const safeReadFile = async (filePath: string) => readFile(filePath).catch(() => null);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetPath?: string[] }> },
) {
  const { assetPath } = await params;
  const resolvedPath = resolveAssetPath(assetPath);
  if (!resolvedPath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileStats = await safeStat(resolvedPath);
  if (!fileStats || !fileStats.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const etag = buildETag(fileStats.size, fileStats.mtimeMs);
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: buildHeaders(resolvedPath, fileStats.size, fileStats.mtimeMs),
    });
  }

  const fileContent = await safeReadFile(resolvedPath);
  if (!fileContent) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(fileContent, {
    status: 200,
    headers: buildHeaders(resolvedPath, fileStats.size, fileStats.mtimeMs),
  });
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ assetPath?: string[] }> },
) {
  const { assetPath } = await params;
  const resolvedPath = resolveAssetPath(assetPath);
  if (!resolvedPath) {
    return new NextResponse(null, { status: 404 });
  }

  const fileStats = await safeStat(resolvedPath);
  if (!fileStats || !fileStats.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const etag = buildETag(fileStats.size, fileStats.mtimeMs);
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: buildHeaders(resolvedPath, fileStats.size, fileStats.mtimeMs),
    });
  }

  return new NextResponse(null, {
    status: 200,
    headers: buildHeaders(resolvedPath, fileStats.size, fileStats.mtimeMs),
  });
}
