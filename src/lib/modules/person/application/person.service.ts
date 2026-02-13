import type { Prisma } from "@prisma/client";
import { ensureMediaRecord } from "@/lib/utils/content-normalizers";
import { createPerson, findPersonByFullNameTx, updatePerson } from "../infrastructure/person.repo";
import type { PersonPayload } from "../domain/person";

const ensureAvatarMedia = (tx: Prisma.TransactionClient, avatar?: string | null) =>
  ensureMediaRecord(tx, avatar, { kind: "image", storageProvider: "local" });

export const ensurePerson = async (tx: Prisma.TransactionClient, person: PersonPayload) => {
  const fullName = person.fullName.trim();
  if (!fullName) {
    throw new Error("fullName is required");
  }

  const avatarMedia = await ensureAvatarMedia(tx, person.avatar);

  const createData: Prisma.PersonCreateInput = {
    fullName,
    firstName: person.firstName ?? null,
    lastName: person.lastName ?? null,
    pseudo: person.pseudo ?? null,
    role: person.role ?? null,
    bio: person.bio ?? null,
    email: person.email ?? null,
    profileData: person.profileData ? (person.profileData as Prisma.InputJsonValue) : undefined,
    siteOwner: person.siteOwner ?? false,
    ...(avatarMedia
      ? {
          avatarMedia: { connect: { id: avatarMedia.id } },
        }
      : {}),
  };

  const updateData: Prisma.PersonUpdateInput = {
    firstName: { set: person.firstName ?? null },
    lastName: { set: person.lastName ?? null },
    pseudo: { set: person.pseudo ?? null },
    role: { set: person.role ?? null },
    bio: { set: person.bio ?? null },
    email: { set: person.email ?? null },
    profileData: {
      set: person.profileData ? (person.profileData as Prisma.InputJsonValue) : undefined,
    },
    siteOwner: { set: person.siteOwner ?? false },
    ...(avatarMedia
      ? {
          avatarMedia: { connect: { id: avatarMedia.id } },
        }
      : undefined),
  };

  const existing = await findPersonByFullNameTx(tx, fullName);
  if (existing) {
    return updatePerson(tx, {
      where: { id: existing.id },
      data: updateData,
    });
  }

  return createPerson(tx, {
    data: createData,
  });
};
