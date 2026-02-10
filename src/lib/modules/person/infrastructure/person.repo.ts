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
