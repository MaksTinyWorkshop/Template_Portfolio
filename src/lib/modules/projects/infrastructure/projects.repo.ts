import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const includeRelations = {
  gallery: {
    include: {
      media: true,
    },
  },
  persons: {
    include: {
      person: {
        include: {
          avatarMedia: true,
        },
      },
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
};

export type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof includeRelations }>;

export const listProjects = (args?: { onlyPublished?: boolean }) =>
  prisma.project.findMany({
    where: args?.onlyPublished ? { status: "published" } : undefined,
    orderBy: { publishedAt: "desc" },
    include: includeRelations,
  });

export const findProjectBySlug = (slug: string) =>
  prisma.project.findFirst({
    where: { slug },
    include: includeRelations,
  });

export const findProjectBySlugTx = (tx: Prisma.TransactionClient, slug: string) =>
  tx.project.findFirst({
    where: { slug },
    include: includeRelations,
  });

export const runProjectTransaction = <T>(work: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(work);

export const projectSlugExists = (tx: Prisma.TransactionClient, slug: string) =>
  tx.project.count({ where: { slug } }).then((count) => count > 0);

export const clearProjectRelations = (tx: Prisma.TransactionClient, projectId: string) =>
  Promise.all([
    tx.projectImage.deleteMany({ where: { projectId } }),
    tx.projectPerson.deleteMany({ where: { projectId } }),
    tx.projectTag.deleteMany({ where: { projectId } }),
  ]);

export const createProject = (tx: Prisma.TransactionClient, args: Prisma.ProjectCreateArgs) =>
  tx.project.create({
    ...args,
    include: includeRelations,
  });

export const updateProject = (tx: Prisma.TransactionClient, args: Prisma.ProjectUpdateArgs) =>
  tx.project.update({
    ...args,
    include: includeRelations,
  });

export const deleteProject = (slug: string) => prisma.project.delete({ where: { slug } });

export const listProjectTags = () =>
  prisma.tag.findMany({
    where: { category: { in: ["project", "global"] } },
    orderBy: { name: "asc" },
    select: { name: true },
  });

export const deleteProjectTx = (
  tx: Prisma.TransactionClient,
  where: Prisma.ProjectWhereUniqueInput,
) =>
  tx.project.delete({
    where,
  });
