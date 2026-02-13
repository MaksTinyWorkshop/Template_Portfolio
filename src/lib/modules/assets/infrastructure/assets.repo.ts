import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AssetConflictError,
  AssetNotFoundError,
  AssetPathValidationError,
} from "../domain/asset.errors";
import type {
  AssetDeleteResult,
  AssetCreateDirectoryPayload,
  AssetListItem,
  AssetListResult,
  AssetRenamePayload,
  AssetRenameResult,
  AssetUploadPayload,
} from "../types";

const PUBLIC_ROOT = path.resolve(process.cwd(), "public", "images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);
const MAX_ASSET_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_ASSET_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-m4v",
  "video/x-matroska",
]);

const sanitizeRelativePath = (value?: string | null) => {
  const source = (value ?? "").replaceAll("\\", "/").trim();
  if (!source) return "";
  const normalized = source.replace(/^\/+/, "").replace(/\/+/g, "/");
  if (
    normalized === "." ||
    normalized.includes("\0") ||
    normalized.split("/").some((segment) => segment === "..")
  ) {
    throw new AssetPathValidationError("Chemin invalide");
  }
  return normalized;
};

const toAbsolutePath = (relativePath?: string | null) => {
  const normalizedRelativePath = sanitizeRelativePath(relativePath);
  const resolved = path.resolve(PUBLIC_ROOT, normalizedRelativePath);
  const relative = path.relative(PUBLIC_ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AssetPathValidationError("Le chemin doit rester dans /public/images");
  }
  return { normalizedRelativePath, resolved };
};

const sanitizeFilename = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AssetPathValidationError("Nom de fichier requis");
  }
  if (path.basename(trimmed) !== trimmed || trimmed.includes("\0")) {
    throw new AssetPathValidationError("Nom de fichier invalide");
  }
  return trimmed;
};

const validateAssetUpload = (file: File) => {
  const extension = path.extname(file.name).toLowerCase();
  const hasAllowedExtension = IMAGE_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension);

  if (!hasAllowedExtension) {
    throw new AssetPathValidationError(
      "Format non supporte. Extensions autorisees: images/videos.",
    );
  }

  if (file.size <= 0 || file.size > MAX_ASSET_FILE_SIZE_BYTES) {
    throw new AssetPathValidationError("Taille de fichier invalide (max 50MB).");
  }

  if (
    file.type &&
    file.type.trim() !== "" &&
    !ALLOWED_ASSET_MIME_TYPES.has(file.type.toLowerCase())
  ) {
    throw new AssetPathValidationError("Type MIME non supporte.");
  }
};

const mapDirectoryEntry = async (
  absoluteDirectory: string,
  normalizedDirectory: string,
  entry: string,
): Promise<AssetListItem> => {
  const absolutePath = path.join(absoluteDirectory, entry);
  const details = await stat(absolutePath);
  const relativePath = normalizedDirectory ? `${normalizedDirectory}/${entry}` : entry;
  const extension = details.isFile() ? path.extname(entry).toLowerCase() || null : null;

  return {
    path: relativePath,
    name: entry,
    kind: details.isDirectory() ? "directory" : "file",
    size: details.isDirectory() ? null : details.size,
    extension,
    updatedAt: details.mtime.toISOString(),
  };
};

const isVisibleAssetItem = (item: AssetListItem) => {
  if (item.name.startsWith(".")) {
    return false;
  }

  if (item.kind === "directory") {
    return true;
  }

  if (!item.extension) {
    return false;
  }

  return IMAGE_EXTENSIONS.has(item.extension) || VIDEO_EXTENSIONS.has(item.extension);
};

export const listAssetsByDirectory = async (directory?: string): Promise<AssetListResult> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(directory);
  await mkdir(resolved, { recursive: true });

  const entries = await readdir(resolved);
  const mapped = await Promise.all(
    entries.map((entry) => mapDirectoryEntry(resolved, normalizedRelativePath, entry)),
  );
  const filtered = mapped.filter(isVisibleAssetItem);
  filtered.sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === "directory" ? -1 : 1;
    }
    return left.name.localeCompare(right.name, "fr", { sensitivity: "base" });
  });

  const segments = normalizedRelativePath ? normalizedRelativePath.split("/") : [];
  const parentDirectory =
    segments.length > 0 ? segments.slice(0, Math.max(segments.length - 1, 0)).join("/") : null;

  return {
    directory: normalizedRelativePath,
    parentDirectory: parentDirectory || null,
    items: filtered,
  };
};

export const uploadAssetToDirectory = async (
  payload: AssetUploadPayload,
): Promise<{ path: string; name: string }> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(payload.directory);
  await mkdir(resolved, { recursive: true });
  validateAssetUpload(payload.file);

  const filename = sanitizeFilename(payload.file.name);
  const destination = path.join(resolved, filename);

  try {
    await stat(destination);
    if (!payload.overwrite) {
      throw new AssetConflictError("Un fichier existe déjà avec ce nom");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const bytes = await payload.file.arrayBuffer();
  await writeFile(destination, Buffer.from(bytes));

  const savedPath = normalizedRelativePath ? `${normalizedRelativePath}/${filename}` : filename;
  return { path: savedPath, name: filename };
};

export const createAssetDirectory = async (
  payload: AssetCreateDirectoryPayload,
): Promise<{ path: string; name: string }> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(payload.directory);
  const directoryName = sanitizeFilename(payload.name);
  const absoluteTarget = path.join(resolved, directoryName);

  try {
    await stat(absoluteTarget);
    throw new AssetConflictError("Un dossier existe déjà avec ce nom");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await mkdir(absoluteTarget, { recursive: false });
  const relativePath = normalizedRelativePath
    ? `${normalizedRelativePath}/${directoryName}`
    : directoryName;
  return { path: relativePath, name: directoryName };
};

export const renameAssetByPath = async (
  payload: AssetRenamePayload,
): Promise<AssetRenameResult> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(payload.path);
  const nextName = sanitizeFilename(payload.name);

  let isDirectory = false;
  try {
    const details = await stat(resolved);
    isDirectory = details.isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AssetNotFoundError(normalizedRelativePath);
    }
    throw error;
  }

  const currentName = path.basename(resolved);
  if (currentName === nextName) {
    return {
      previousPath: normalizedRelativePath,
      path: normalizedRelativePath,
      name: currentName,
      kind: isDirectory ? "directory" : "file",
    };
  }

  const parentAbsolute = path.dirname(resolved);
  const destinationAbsolute = path.join(parentAbsolute, nextName);
  try {
    await stat(destinationAbsolute);
    throw new AssetConflictError("Un asset existe déjà avec ce nom");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await rename(resolved, destinationAbsolute);
  const parentRelative = path.posix.dirname(normalizedRelativePath);
  const baseDirectory = parentRelative === "." ? "" : parentRelative;
  const nextPath = baseDirectory ? `${baseDirectory}/${nextName}` : nextName;

  return {
    previousPath: normalizedRelativePath,
    path: nextPath,
    name: nextName,
    kind: isDirectory ? "directory" : "file",
  };
};

export const deleteAssetByPath = async (assetPath: string): Promise<AssetDeleteResult> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(assetPath);
  if (!normalizedRelativePath) {
    throw new AssetPathValidationError("Suppression de la racine /public interdite");
  }

  let isDirectory = false;
  try {
    const details = await stat(resolved);
    isDirectory = details.isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AssetNotFoundError(normalizedRelativePath);
    }
    throw error;
  }

  await rm(resolved, { recursive: true, force: false });
  return {
    path: normalizedRelativePath,
    kind: isDirectory ? "directory" : "file",
  };
};

export const getAssetByPathInfo = async (assetPath: string): Promise<AssetDeleteResult> => {
  const { normalizedRelativePath, resolved } = toAbsolutePath(assetPath);
  if (!normalizedRelativePath) {
    throw new AssetPathValidationError("Suppression de la racine /public interdite");
  }

  try {
    const details = await stat(resolved);
    return {
      path: normalizedRelativePath,
      kind: details.isDirectory() ? "directory" : "file",
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AssetNotFoundError(normalizedRelativePath);
    }
    throw error;
  }
};
