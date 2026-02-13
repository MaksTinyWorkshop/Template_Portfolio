import { prisma } from "@/lib/prisma";
import type { TagCategory } from "@prisma/client";

function normalizeSlugForComparison(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u00AD]/g, "-")
    .trim()
    .toLowerCase();
}

/**
 * Génère un slug unique à partir d'un nom
 */
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer caractères spéciaux par tirets
    .replace(/^-|-$/g, ""); // Retirer tirets début/fin

  let slug = baseSlug;
  let counter = 2;

  // Vérifier l'unicité et incrémenter si nécessaire
  while (
    await prisma.tag.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

const includeWithCounts = {
  _count: {
    select: {
      articleTags: true,
      projectTags: true,
    },
  },
} as const;

/**
 * Liste tous les tags
 */
export async function listTags() {
  return prisma.tag.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: includeWithCounts,
  });
}

/**
 * Récupère un tag par ID
 */
export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    include: includeWithCounts,
  });
}

/**
 * Récupère un tag par slug
 */
export async function getTagBySlug(slug: string) {
  const decoded = (() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  })();
  const normalizedSlug = decoded.trim().toLowerCase();

  const direct = await prisma.tag.findFirst({
    where: {
      slug: {
        equals: normalizedSlug,
        mode: "insensitive",
      },
    },
    include: includeWithCounts,
  });

  if (direct) {
    return direct;
  }

  const normalizedInput = normalizeSlugForComparison(decoded);
  const candidates = await prisma.tag.findMany({ select: { id: true, slug: true } });
  const match = candidates.find((tag) => normalizeSlugForComparison(tag.slug) === normalizedInput);
  if (!match) {
    return null;
  }
  return getTagById(match.id);
}

/**
 * Crée un nouveau tag
 */
export async function createTag(data: {
  name: string;
  category: TagCategory;
  description?: string;
  color?: string;
}) {
  const slug = await generateUniqueSlug(data.name);

  return prisma.tag.create({
    data: {
      ...data,
      slug,
    },
  });
}

/**
 * Met à jour un tag
 */
export async function updateTag(
  id: string,
  data: {
    name?: string;
    category?: TagCategory;
    description?: string;
    color?: string;
  },
) {
  // Si le nom change, régénérer le slug (sans s'auto-collisionner)
  let slug: string | undefined;
  if (data.name) {
    const current = await prisma.tag.findUnique({ where: { id }, select: { name: true } });
    if (current && current.name !== data.name) {
      slug = await generateUniqueSlug(data.name, id);
    }
  }

  return prisma.tag.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  });
}

/**
 * Supprime un tag (avec cascade sur les relations)
 */
export async function deleteTag(id: string) {
  return prisma.$transaction([
    // Supprimer les relations
    prisma.articleTag.deleteMany({ where: { tagId: id } }),
    prisma.projectTag.deleteMany({ where: { tagId: id } }),
    // Supprimer le tag
    prisma.tag.delete({ where: { id } }),
  ]);
}
