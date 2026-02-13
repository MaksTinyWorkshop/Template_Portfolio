import { prisma } from "@/lib/prisma";
import type { AssetDeleteResult, AssetKind, AssetRenameResult } from "../types";

const toPublicUrl = (relativePath: string) => {
  const normalized = relativePath.replace(/^\/+/, "");
  return normalized ? `/images/${normalized}` : "/images";
};

const toApiUrl = (relativePath: string) => {
  const normalized = relativePath.replace(/^\/+/, "");
  return normalized ? `/api/assets/${normalized}` : "/api/assets";
};

const replacePathPrefix = (value: string, oldPrefix: string, nextPrefix: string) => {
  if (value === oldPrefix) {
    return nextPrefix;
  }
  if (value.startsWith(`${oldPrefix}/`)) {
    return `${nextPrefix}${value.slice(oldPrefix.length)}`;
  }
  return value;
};

const buildUrlMatcher = (kind: AssetKind, relativePath: string) => {
  const publicUrl = toPublicUrl(relativePath);
  const apiUrl = toApiUrl(relativePath);
  if (kind === "directory") {
    return {
      urls: [publicUrl, apiUrl],
      prefixes: [`${publicUrl}/`, `${apiUrl}/`],
    };
  }
  return { urls: [publicUrl, apiUrl], prefixes: [] as string[] };
};

const listImpactedMediaIds = async (asset: { path: string; kind: AssetKind }) => {
  const matcher = buildUrlMatcher(asset.kind, asset.path);
  const records =
    asset.kind === "directory"
      ? await prisma.media.findMany({
          where: {
            OR: [
              { url: matcher.urls[0] },
              { url: matcher.urls[1] },
              { url: { startsWith: matcher.prefixes[0] } },
              { url: { startsWith: matcher.prefixes[1] } },
            ],
          },
          select: { id: true },
        })
      : await prisma.media.findMany({
          where: { url: { in: matcher.urls } },
          select: { id: true },
        });
  return records.map((entry) => entry.id);
};

export const renameAssetReferences = async (renameResult: AssetRenameResult) => {
  const previousPublicUrl = toPublicUrl(renameResult.previousPath);
  const previousApiUrl = toApiUrl(renameResult.previousPath);
  const nextPublicUrl = toPublicUrl(renameResult.path);
  const nextApiUrl = toApiUrl(renameResult.path);

  if (renameResult.kind === "file") {
    await prisma.media.updateMany({
      where: { url: { in: [previousPublicUrl, previousApiUrl] } },
      data: { url: nextApiUrl },
    });
    return;
  }

  const mediaRows = await prisma.media.findMany({
    where: {
      OR: [
        { url: previousPublicUrl },
        { url: previousApiUrl },
        { url: { startsWith: `${previousPublicUrl}/` } },
        { url: { startsWith: `${previousApiUrl}/` } },
      ],
    },
    select: { id: true, url: true },
  });

  await prisma.$transaction(
    mediaRows.map((media) => {
      const nextUrl = replacePathPrefix(media.url, previousPublicUrl, nextPublicUrl);
      const normalizedNextUrl = replacePathPrefix(nextUrl, previousApiUrl, nextApiUrl);
      return prisma.media.update({
        where: { id: media.id },
        data: { url: normalizedNextUrl },
      });
    }),
  );
};

export const cleanupAssetReferences = async (asset: AssetDeleteResult) => {
  const mediaIds = await listImpactedMediaIds(asset);

  await prisma.$transaction(async (tx) => {
    if (!mediaIds.length) return;

    await tx.article.updateMany({
      where: { mediaId: { in: mediaIds } },
      data: { mediaId: null },
    });
    await tx.projectImage.deleteMany({
      where: { mediaId: { in: mediaIds } },
    });
    await tx.person.updateMany({
      where: { avatarMediaId: { in: mediaIds } },
      data: { avatarMediaId: null },
    });
    await tx.media.deleteMany({
      where: { id: { in: mediaIds } },
    });
  });
};
