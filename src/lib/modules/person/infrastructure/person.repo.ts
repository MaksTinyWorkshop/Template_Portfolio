import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const includeRelations = {
  avatarMedia: true,
};

export type PersonWithRelations = Prisma.PersonGetPayload<{
  include: typeof includeRelations;
}>;

export const listPersons = () =>
  prisma.person.findMany({
    include: includeRelations,
  });

const includeAdminRelations = {
  avatarMedia: true,
  _count: {
    select: {
      articles: true,
      projects: true,
    },
  },
} as const;

export type PersonAdminWithRelations = Prisma.PersonGetPayload<{
  include: typeof includeAdminRelations;
}>;

export const listPersonsForAdmin = () =>
  prisma.person.findMany({
    include: includeAdminRelations,
    orderBy: [{ siteOwner: "desc" }, { fullName: "asc" }],
  });

export const findPersonByIdForAdmin = (id: string) =>
  prisma.person.findUnique({
    where: { id },
    include: includeAdminRelations,
  });

export const findPersonByFullName = (fullName: string) =>
  prisma.person.findFirst({
    where: { fullName },
    include: includeRelations,
  });

export const findPersonByFullNameTx = (tx: Prisma.TransactionClient, fullName: string) =>
  tx.person.findFirst({
    where: { fullName },
    include: includeRelations,
  });

export const findPersonById = (id: string) =>
  prisma.person.findUnique({
    where: { id },
    include: includeRelations,
  });

export const findSiteOwner = () =>
  prisma.person.findFirst({
    where: { siteOwner: true },
    include: includeRelations,
  });

export const findSiteOwnerTx = (tx: Prisma.TransactionClient) =>
  tx.person.findFirst({
    where: { siteOwner: true },
    include: includeRelations,
  });

export const createPerson = (tx: Prisma.TransactionClient, args: Prisma.PersonCreateArgs) =>
  tx.person.create({
    ...args,
    include: includeRelations,
  });

export const updatePerson = (tx: Prisma.TransactionClient, args: Prisma.PersonUpdateArgs) =>
  tx.person.update({
    ...args,
    include: includeRelations,
  });

export const deletePersonById = (tx: Prisma.TransactionClient, id: string) =>
  tx.person.delete({ where: { id } });

export const createPersonForAdmin = (data: Prisma.PersonCreateInput) =>
  prisma.person.create({
    data,
    include: includeAdminRelations,
  });

export const updatePersonForAdmin = (id: string, data: Prisma.PersonUpdateInput) =>
  prisma.person.update({
    where: { id },
    data,
    include: includeAdminRelations,
  });

export const deletePersonForAdmin = (id: string) =>
  prisma.$transaction(async (tx) => {
    await tx.articlePerson.deleteMany({ where: { personId: id } });
    await tx.projectPerson.deleteMany({ where: { personId: id } });
    await tx.media.updateMany({ where: { uploadedById: id }, data: { uploadedById: null } });
    await tx.availabilityLog.deleteMany({ where: { personId: id } });
    await tx.person.delete({ where: { id } });
  });
