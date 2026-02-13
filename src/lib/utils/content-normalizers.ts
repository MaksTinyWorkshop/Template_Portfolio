import { ValidationError } from "@/lib/http/errors";
import { slugify } from "@/lib/utils/slugify";
import type { MediaKind, Prisma, PrismaClient, TagCategory } from "@prisma/client";

export const normalizeSlugInput = (slug?: string, fallback?: string): string =>
  slugify(slug?.trim() ? slug : (fallback ?? ""));

export const normalizeStringList = (values: Array<string | null | undefined>): string[] =>
  Array.from(
    new Set(
      values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)),
    ),
  );

const normalizeSlashPrefix = (value: string) => `/${value.replace(/^\/+/, "")}`;

const normalizeAssetApiUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const normalized = normalizeSlashPrefix(trimmed).replace(/\/+/g, "/");
  if (normalized === "/images") return "/api/assets";
  if (normalized.startsWith("/images/")) {
    return `/api/assets/${normalized.slice("/images/".length)}`;
  }
  if (normalized === "/api/assets" || normalized.startsWith("/api/assets/")) {
    return normalized;
  }
  return trimmed;
};

export const normalizeMediaUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const normalized = normalizeAssetApiUrl(url);
  return normalized || null;
};

export const ensureTagForCategory = async (
  tx: Prisma.TransactionClient | PrismaClient,
  name: string,
  category: TagCategory,
  errorMessage = "Le tag est requis",
) => {
  const normalized = name.trim();
  if (!normalized) {
    throw new ValidationError(errorMessage);
  }

  // Prefer reusing an existing tag by name. This avoids accidental duplicates when a tag
  // was created with a suffixed slug (e.g. "test-2") but the content forms only send the name.
  // Also prevents "upsert by slug" from renaming an unrelated tag that happens to share a slug.
  const eligibleCategories =
    category === "article"
      ? (["article", "global"] as const)
      : category === "project"
        ? (["project", "global"] as const)
        : (["global"] as const);

  const existing = await tx.tag.findFirst({
    where: {
      name: { equals: normalized, mode: "insensitive" },
      category: { in: [...eligibleCategories] },
    },
  });
  if (existing) {
    return existing;
  }

  const baseSlug = slugify(normalized);
  if (!baseSlug) {
    throw new ValidationError(errorMessage);
  }

  let slug = baseSlug;
  let counter = 2;
  while (await tx.tag.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return tx.tag.create({
    data: { slug, name: normalized, category },
  });
};

export const ensureMediaRecord = async (
  tx: Prisma.TransactionClient | PrismaClient,
  url?: string | null,
  options?: {
    kind?: MediaKind;
    storageProvider?: string | null;
    uploadedById?: string | null;
  },
) => {
  const normalized = normalizeMediaUrl(url);
  if (!normalized) return null;

  const existing = await tx.media.findFirst({ where: { url: normalized } });
  if (existing) {
    return existing;
  }

  return tx.media.create({
    data: {
      url: normalized,
      kind: options?.kind ?? "image",
      storageProvider: options?.storageProvider ?? "local",
      uploadedById: options?.uploadedById ?? null,
    },
  });
};
