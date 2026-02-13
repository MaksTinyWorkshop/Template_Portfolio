import { ValidationError } from "@/lib/http/errors";
import { ensurePerson } from "@/lib/modules/person";
import { findSiteOwnerTx } from "@/lib/modules/person/infrastructure/person.repo";
import {
  ensureMediaRecord,
  ensureTagForCategory,
  normalizeSlugInput,
  normalizeStringList,
} from "@/lib/utils/content-normalizers";
import type { MediaPurpose, Prisma } from "@prisma/client";
import type { ProjectStatus } from "../domain/project";
import { ProjectNotFoundError } from "../domain/project.errors";
import {
  type ProjectWithRelations,
  clearProjectRelations,
  createProject,
  deleteProjectTx,
  listProjects as fetchProjects,
  findProjectBySlug,
  findProjectBySlugTx,
  listProjectTags,
  projectSlugExists,
  runProjectTransaction,
  updateProject,
} from "../infrastructure/projects.repo";
import type {
  ProjectAdminDetail,
  ProjectAdminListItem,
  ProjectAdminPayload,
  TeamMemberInput,
} from "../types";
import { projectListSchema, projectSummarySchema } from "./projects.dto";

const unique = (items: Array<string | null | undefined>) => [
  ...new Set(items.filter(Boolean) as string[]),
];

const normalizeHttpUrlOrNull = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
};

const extractLinkedIn = (profileData: Prisma.JsonValue | null) => {
  if (!profileData || typeof profileData !== "object") {
    return null;
  }

  const profile = profileData as Record<string, unknown>;
  const contacts = profile.contacts as Record<string, unknown> | undefined;

  const linkedIn = (contacts as { linkedin?: unknown } | undefined)?.linkedin;
  if (typeof linkedIn === "string") {
    return linkedIn;
  }

  return null;
};

const getProfileContacts = (profileData: Prisma.JsonValue | null) => {
  if (!profileData || typeof profileData !== "object") {
    return {};
  }
  const profile = profileData as Record<string, unknown>;
  const contacts = profile.contacts as Record<string, unknown> | undefined;
  if (!contacts || typeof contacts !== "object") {
    return {};
  }
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(contacts)) {
    if (typeof value !== "string") continue;
    const normalized = value.trim();
    if (!normalized) continue;
    sanitized[key.toLowerCase()] = normalized;
  }
  return sanitized;
};

const mapContactsToSocials = (contacts: Record<string, string>) =>
  Object.entries(contacts)
    .filter(([key]) => key !== "linkedin")
    .map(([key, url]) => ({
      name: key,
      url,
    }));

const buildMemberContacts = (member: TeamMemberInput) => {
  const contacts: Record<string, string> = {};
  if (member.linkedIn) {
    const trimmed = member.linkedIn.trim();
    if (trimmed) contacts.linkedin = trimmed;
  }

  if (member.socials?.length) {
    for (const social of member.socials) {
      if (!social?.name || !social.url) continue;
      const normalizedName = social.name.toLowerCase().trim();
      if (!normalizedName) continue;
      contacts[normalizedName] = social.url.trim();
    }
  }

  return contacts;
};

const normalizeGallery = (gallery: ProjectWithRelations["gallery"]) =>
  [...gallery]
    .filter((entry) => entry.purpose === "gallery")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((entry) => entry.media?.url)
    .filter(Boolean) as string[];

const selectHeroImage = (project: ProjectWithRelations) => {
  const orderedGallery = normalizeGallery(project.gallery);
  return orderedGallery.length ? orderedGallery[0] : null;
};

const selectExplicitCover = (project: ProjectWithRelations) => {
  const cover = project.gallery.find((entry) => entry.purpose === "cover");
  return cover?.media?.url ?? null;
};

const toProjectSummary = (project: ProjectWithRelations) => {
  const explicitCover = selectExplicitCover(project);
  const heroImage = explicitCover ?? selectHeroImage(project);
  const rawGallery = normalizeGallery(project.gallery);
  const gallery = explicitCover
    ? rawGallery.filter((source) => source !== explicitCover)
    : rawGallery;
  const images = heroImage ? [heroImage, ...gallery.filter((src) => src !== heroImage)] : gallery;

  // Extract unique tags with their colors
  const tagMap = new Map<string, { slug: string; name: string; color: string | null }>();
  for (const relation of project.tags) {
    if (!tagMap.has(relation.tag.slug)) {
      tagMap.set(relation.tag.slug, {
        slug: relation.tag.slug,
        name: relation.tag.name,
        color: relation.tag.color ?? null,
      });
    }
  }
  const typeProjectTag = Array.from(tagMap.values());

  const team = project.persons
    .map((relation) => {
      const person = relation.person;
      if (!person) return null;
      const contacts = getProfileContacts(person.profileData);
      return {
        name: person.pseudo ?? person.fullName,
        role: relation.role ?? person.role ?? null,
        avatar: person.avatarMedia?.url ?? null,
        linkedIn: normalizeHttpUrlOrNull(contacts.linkedin ?? extractLinkedIn(person.profileData)),
        socials: mapContactsToSocials(contacts),
        isSiteOwner: Boolean(person.siteOwner),
        personId: person.id,
        firstName: person.firstName ?? null,
        lastName: person.lastName ?? null,
        pseudo: person.pseudo ?? null,
        email: person.email ?? null,
      };
    })
    .filter(Boolean) as TeamMemberInput[];

  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary ?? null,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    status: project.status,
    typeProjectTag,
    heroImage,
    gallery,
    images,
    link: project.link ?? null,
    repository: project.repository ?? null,
    content: project.content ?? null,
    team,
  };
};

const parseProjectDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildGalleryEntries = async (tx: Prisma.TransactionClient, payload: ProjectAdminPayload) => {
  const collectedImages = normalizeStringList(payload.images);
  const coverUrl = payload.featuredImage?.trim() || null;
  const remainingImages = collectedImages.filter((url) => url !== coverUrl);
  const entries: Array<{
    media: { connect: { id: string } };
    purpose: MediaPurpose;
    order: number;
  }> = [];
  let order = 0;

  if (coverUrl) {
    const media = await ensureMediaRecord(tx, coverUrl);
    if (media) {
      entries.push({
        media: { connect: { id: media.id } },
        purpose: "cover",
        order: order++,
      });
    }
  }

  for (const imageUrl of remainingImages) {
    const media = await ensureMediaRecord(tx, imageUrl);
    if (!media) continue;
    entries.push({
      media: { connect: { id: media.id } },
      purpose: "gallery",
      order: order++,
    });
  }

  return entries;
};

const buildTeamEntries = async (tx: Prisma.TransactionClient, members: TeamMemberInput[]) => {
  const entries: Array<Prisma.ProjectPersonCreateWithoutProjectInput> = [];
  const includesOwner = members.some((member) => Boolean(member.isSiteOwner));

  if (!includesOwner) {
    const defaultPerson = await findSiteOwnerTx(tx);
    if (defaultPerson) {
      entries.push({
        person: { connect: { id: defaultPerson.id } },
        role: defaultPerson.role ?? null,
        order: entries.length,
        primary: false,
      });
    }
  }

  for (const member of members) {
    if (member.personId) {
      entries.push({
        person: { connect: { id: member.personId } },
        role: member.role || null,
        order: entries.length,
        primary: entries.length === 0,
      });
      continue;
    }

    const contacts = buildMemberContacts(member);
    const profileData = Object.keys(contacts).length ? { contacts } : null;

    const person = await ensurePerson(tx, {
      fullName: member.name,
      role: member.role || null,
      avatar: member.avatar || null,
      firstName: member.firstName ?? null,
      lastName: member.lastName ?? null,
      pseudo: member.pseudo ?? null,
      email: member.email ?? null,
      profileData,
    });
    entries.push({
      person: { connect: { id: person.id } },
      role: member.role || null,
      order: entries.length,
      primary: entries.length === 0,
    });
  }

  return entries;
};

const buildTagEntries = async (tx: Prisma.TransactionClient, tags: string[]) => {
  const uniqueTags = normalizeStringList(tags);
  const entries: Array<Prisma.ProjectTagCreateWithoutProjectInput> = [];
  for (const name of uniqueTags) {
    const tag = await ensureTagForCategory(
      tx,
      name,
      "project",
      "Les tags doivent contenir du texte",
    );
    entries.push({
      tag: { connect: { id: tag.id } },
    });
  }
  return entries;
};

const mapProjectToAdminListItem = (project: ProjectWithRelations): ProjectAdminListItem => ({
  slug: project.slug,
  title: project.title,
  summary: project.summary ?? "",
  publishedAt: project.publishedAt?.toISOString() ?? "",
  status: project.status,
  typeProjectTag: unique(project.tags.map((relation) => relation.tag.name)),
});

const mapProjectToAdminDetail = (project: ProjectWithRelations): ProjectAdminDetail => ({
  slug: project.slug,
  metadata: {
    title: project.title,
    summary: project.summary ?? "",
    publishedAt: project.publishedAt?.toISOString() ?? "",
    status: project.status,
    typeProjectTag: unique(project.tags.map((relation) => relation.tag.name)),
    featuredImage: selectExplicitCover(project) ?? undefined,
    images: normalizeGallery(project.gallery),
    team: project.persons
      .map((relation) => {
        const person = relation.person;
        if (!person) return null;
        const contacts = getProfileContacts(person.profileData);
        return {
          name: person.fullName,
          role: relation.role ?? person.role ?? "",
          avatar: person.avatarMedia?.url ?? "",
          linkedIn:
            normalizeHttpUrlOrNull(contacts.linkedin ?? extractLinkedIn(person.profileData)) ??
            undefined,
          socials: mapContactsToSocials(contacts),
          isSiteOwner: Boolean(person.siteOwner),
          personId: person.id,
          firstName: person.firstName ?? null,
          lastName: person.lastName ?? null,
          pseudo: person.pseudo ?? null,
          email: person.email ?? null,
        };
      })
      .filter(Boolean) as TeamMemberInput[],
    link: project.link ?? undefined,
    repository: project.repository ?? undefined,
  },
  content: project.content ?? "",
});

export const listProjects = async () => {
  const rows = await fetchProjects({ onlyPublished: true });
  return projectListSchema.parse(rows.map(toProjectSummary));
};

export const listProjectSlugs = async () => {
  const rows = await fetchProjects({ onlyPublished: true });
  return rows.map((project) => project.slug);
};

export const getProjectBySlug = async (slug: string) => {
  const project = await findProjectBySlug(slug);
  if (!project) {
    throw new ProjectNotFoundError(slug);
  }
  return projectSummarySchema.parse(toProjectSummary(project));
};

const mapSlug = (slug?: string, title?: string) => normalizeSlugInput(slug, title ?? "");

export const listProjectsAdmin = async () => {
  const rows = await fetchProjects();
  return rows.map(mapProjectToAdminListItem);
};

export const getProjectForAdmin = async (slug: string) => {
  const project = await findProjectBySlug(slug);
  if (!project) {
    throw new ProjectNotFoundError(slug);
  }
  return mapProjectToAdminDetail(project);
};

export const createProjectAdmin = async (payload: ProjectAdminPayload) => {
  const slug = mapSlug(payload.slug, payload.title);
  return runProjectTransaction(async (tx) => {
    const exists = await projectSlugExists(tx, slug);
    if (exists) {
      throw new ValidationError("Un projet existe déjà avec ce slug");
    }

    const galleryEntries = await buildGalleryEntries(tx, payload);
    const teamEntries = await buildTeamEntries(tx, payload.team);
    const tagEntries = await buildTagEntries(tx, payload.typeProjectTag);

    const created = await createProject(tx, {
      data: {
        slug,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        status: payload.status,
        publishedAt: parseProjectDate(payload.publishedAt),
        link: payload.link ?? null,
        repository: payload.repository ?? null,
        gallery: galleryEntries.length ? { create: galleryEntries } : undefined,
        persons: teamEntries.length ? { create: teamEntries } : undefined,
        tags: tagEntries.length ? { create: tagEntries } : undefined,
      },
    });

    return mapProjectToAdminDetail(created);
  });
};

export const updateProjectAdmin = async (slug: string, payload: ProjectAdminPayload) => {
  const targetSlug = normalizeSlugInput(slug);
  const newSlug = mapSlug(payload.slug, payload.title);
  return runProjectTransaction(async (tx) => {
    const project = await findProjectBySlugTx(tx, targetSlug);
    if (!project) {
      throw new ProjectNotFoundError(slug);
    }
    if (newSlug !== targetSlug) {
      const conflict = await projectSlugExists(tx, newSlug);
      if (conflict) {
        throw new ValidationError("Un autre projet utilise déjà ce slug");
      }
    }

    await clearProjectRelations(tx, project.id);

    const galleryEntries = await buildGalleryEntries(tx, payload);
    const teamEntries = await buildTeamEntries(tx, payload.team);
    const tagEntries = await buildTagEntries(tx, payload.typeProjectTag);

    const updated = await updateProject(tx, {
      where: { id: project.id },
      data: {
        slug: newSlug,
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        status: payload.status,
        publishedAt: parseProjectDate(payload.publishedAt),
        link: payload.link ?? null,
        repository: payload.repository ?? null,
        gallery: galleryEntries.length ? { create: galleryEntries } : undefined,
        persons: teamEntries.length ? { create: teamEntries } : undefined,
        tags: tagEntries.length ? { create: tagEntries } : undefined,
      },
    });

    return mapProjectToAdminDetail(updated);
  });
};

export const deleteProjectAdmin = async (slug: string) => {
  const targetSlug = normalizeSlugInput(slug);
  return runProjectTransaction(async (tx) => {
    const project = await findProjectBySlugTx(tx, targetSlug);
    if (!project) {
      throw new ProjectNotFoundError(slug);
    }

    await clearProjectRelations(tx, project.id);
    await deleteProjectTx(tx, { id: project.id });
  });
};

export const setProjectStatus = async (slug: string, status: ProjectStatus) => {
  return runProjectTransaction((tx) =>
    updateProject(tx, {
      where: { slug: normalizeSlugInput(slug) },
      data: { status },
    }),
  );
};

export const listProjectTagNames = async () => {
  const rows = await listProjectTags();
  return rows.map((tag) => tag.name);
};
