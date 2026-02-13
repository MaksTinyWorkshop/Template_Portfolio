import { ValidationError } from "@/lib/http/errors";
import { prisma } from "@/lib/prisma";
import { ensureMediaRecord, normalizeMediaUrl } from "@/lib/utils/content-normalizers";
import type { Prisma } from "@prisma/client";
import {
  createPersonForAdmin,
  deletePersonForAdmin,
  findPersonByIdForAdmin,
  listPersonsForAdmin,
  updatePersonForAdmin,
  type PersonAdminWithRelations,
} from "../infrastructure/person.repo";
import { PersonDeletionForbiddenError, PersonNotFoundError } from "../domain/person.errors";
import { normalizeSocialNetworkKey } from "../domain/social-networks";
import { SOCIAL_NETWORK_OPTIONS } from "../domain/social-networks";
import type { PersonAdminDetail, PersonAdminListItem, PersonAdminPayload } from "../types";

const toNullableString = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return value ?? null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const sanitizeContactValue = (value: string) => {
  const trimmed = value.trim();
  if (trimmed && !/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return "";
  }
  return trimmed;
};

const sanitizeProfileData = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined || !isObjectRecord(value)) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = { ...value };
  const contacts = isObjectRecord(value.contacts) ? value.contacts : null;

  if (contacts) {
    const incomingContacts = Object.fromEntries(
      Object.entries(contacts)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([key, url]) => {
          const normalizedKey = normalizeSocialNetworkKey(key);
          return normalizedKey ? [normalizedKey, sanitizeContactValue(url)] : null;
        })
        .filter(
          (entry): entry is [NonNullable<ReturnType<typeof normalizeSocialNetworkKey>>, string] =>
            entry !== null,
        ),
    );

    const safeContacts = Object.fromEntries(
      SOCIAL_NETWORK_OPTIONS.map((option) => [
        option.key,
        typeof incomingContacts[option.key] === "string" ? incomingContacts[option.key] : "",
      ]),
    );

    sanitized.contacts = safeContacts;
  }

  return Object.keys(sanitized).length > 0 ? (sanitized as Prisma.InputJsonValue) : undefined;
};

const toJsonInput = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return sanitizeProfileData(value);
};

const buildFullName = (firstName?: string | null, lastName?: string | null): string => {
  const first = toNullableString(firstName) ?? "";
  const last = toNullableString(lastName) ?? "";
  const fullName = [first, last].filter(Boolean).join(" ").trim();
  if (!fullName) {
    throw new ValidationError("Le prénom et le nom sont requis");
  }
  return fullName;
};

const mapPersonAdminDetail = (person: PersonAdminWithRelations): PersonAdminDetail => ({
  id: person.id,
  fullName: person.fullName,
  firstName: person.firstName ?? null,
  lastName: person.lastName ?? null,
  pseudo: person.pseudo ?? null,
  role: person.role ?? null,
  bio: person.bio ?? null,
  email: person.email ?? null,
  avatar: person.avatarMedia?.url ?? null,
  profileData: person.profileData ?? null,
  siteOwner: person.siteOwner ?? false,
});

export const listPersonsAdmin = async (): Promise<PersonAdminListItem[]> => {
  const persons = await listPersonsForAdmin();
  return persons.map((person) => ({
    ...mapPersonAdminDetail(person),
    _count: {
      articles: person._count.articles,
      projects: person._count.projects,
    },
  }));
};

export const getPersonForAdmin = async (id: string): Promise<PersonAdminDetail> => {
  const person = await findPersonByIdForAdmin(id);
  if (!person) {
    throw new PersonNotFoundError(id);
  }
  return mapPersonAdminDetail(person);
};

export const createPersonAdmin = async (
  payload: Required<Pick<PersonAdminPayload, "firstName" | "lastName">> & PersonAdminPayload,
) => {
  const fullName = buildFullName(payload.firstName, payload.lastName);
  const avatarUrl = normalizeMediaUrl(toNullableString(payload.avatar));
  const avatarMedia = await ensureMediaRecord(prisma, avatarUrl);

  return createPersonForAdmin({
    fullName,
    firstName: toNullableString(payload.firstName),
    lastName: toNullableString(payload.lastName),
    pseudo: toNullableString(payload.pseudo),
    role: toNullableString(payload.role),
    bio: toNullableString(payload.bio),
    email: toNullableString(payload.email),
    ...(avatarMedia && {
      avatarMedia: { connect: { id: avatarMedia.id } },
    }),
    siteOwner: false,
    profileData: toJsonInput(payload.profileData),
  });
};

export const updatePersonAdmin = async (id: string, payload: PersonAdminPayload) => {
  const existing = await findPersonByIdForAdmin(id);
  if (!existing) {
    throw new PersonNotFoundError(id);
  }

  const nextFirstName = payload.firstName ?? existing.firstName;
  const nextLastName = payload.lastName ?? existing.lastName;
  const fullName = buildFullName(nextFirstName, nextLastName);
  const avatarUrl =
    payload.avatar !== undefined ? normalizeMediaUrl(toNullableString(payload.avatar)) : undefined;
  const avatarMedia =
    payload.avatar !== undefined ? await ensureMediaRecord(prisma, avatarUrl) : undefined;

  return updatePersonForAdmin(id, {
    fullName,
    ...(payload.firstName !== undefined && { firstName: toNullableString(payload.firstName) }),
    ...(payload.lastName !== undefined && { lastName: toNullableString(payload.lastName) }),
    ...(payload.pseudo !== undefined && { pseudo: toNullableString(payload.pseudo) }),
    ...(payload.role !== undefined && { role: toNullableString(payload.role) }),
    ...(payload.bio !== undefined && { bio: toNullableString(payload.bio) }),
    ...(payload.email !== undefined && { email: toNullableString(payload.email) }),
    ...(payload.avatar !== undefined &&
      (avatarMedia
        ? { avatarMedia: { connect: { id: avatarMedia.id } } }
        : { avatarMedia: { disconnect: true } })),
    ...(payload.profileData !== undefined && { profileData: toJsonInput(payload.profileData) }),
  });
};

export const deletePersonAdmin = async (id: string) => {
  const existing = await findPersonByIdForAdmin(id);
  if (!existing) {
    throw new PersonNotFoundError(id);
  }
  if (existing.siteOwner) {
    throw new PersonDeletionForbiddenError();
  }
  await deletePersonForAdmin(id);
};
