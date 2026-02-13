export const IMAGE_ASSET_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
] as const;

export const UPLOAD_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const UPLOAD_TARGET_DIRECTORIES = {
  project: "projects",
  post: "articles",
  avatar: "avatars",
} as const;

export type UploadTargetType = keyof typeof UPLOAD_TARGET_DIRECTORIES;

export const getAssetDirectoryFromType = (type: UploadTargetType) =>
  UPLOAD_TARGET_DIRECTORIES[type];
