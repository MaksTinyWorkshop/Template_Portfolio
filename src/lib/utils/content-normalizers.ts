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
  const slug = slugify(normalized);
  return tx.tag.upsert({
    where: { slug },
    create: { slug, name: normalized, category },
    update: { name: normalized },
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
  if (!url) return null;

  const normalized = url.toString().trim();
  if (!normalized) return null;

  const existing = await tx.media.findFirst({ where: { url: normalized } });
  if (existing) {
    return existing;
  }

  return tx.media.create({
    data: {
      url: normalized,
      kind: options?.kind ?? "image",
      storagePath: normalized,
      storageProvider: options?.storageProvider ?? "local",
      uploadedById: options?.uploadedById ?? null,
    },
  });
};
