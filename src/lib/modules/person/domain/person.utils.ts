import type { IconName } from "@/web/types/content.types";
import type { PersonProfile, PersonProfileData } from "./person";
import type { PersonWithRelations } from "../infrastructure/person.repo";

export interface SocialLink {
  name: string;
  label: string;
  url: string;
  icon?: IconName;
  essential?: boolean;
}

const ICON_MAP: Record<string, IconName> = {
  linkedin: "linkedin",
  github: "github",
  malt: "malt",
  whatsapp: "whatsapp",
  email: "email",
  calendar: "calendar",
};

const normalizeKey = (value?: string) => value?.trim().toLowerCase() ?? "";
const ESSENTIAL_SOCIALS = new Set([
  "linkedin",
  "github",
  "malt",
  "whatsapp",
  "email",
]);

const normalizeProfileData = (value: unknown): PersonProfileData | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as PersonProfileData;
};

export function buildSocialLinks(person?: PersonProfile | null): SocialLink[] {
  if (!person?.profileData) {
    return [];
  }

  const seen = new Map<string, SocialLink>();

  const addLink = (name: string, url: string) => {
    const key = normalizeKey(name);
    if (!key || !url || seen.has(key)) {
      return;
    }

    const icon = ICON_MAP[key];
    seen.set(key, {
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      url,
      icon,
      essential: ESSENTIAL_SOCIALS.has(key),
    });
  };

  for (const [contactName, contactValue] of Object.entries(
    person.profileData.contacts ?? {},
  )) {
    if (typeof contactValue === "string") {
      addLink(contactName, contactValue);
    }
  }

  return Array.from(seen.values());
}

export function buildPersonProfile(person: PersonWithRelations): PersonProfile {
  return {
    id: person.id,
    fullName: person.fullName,
    role: person.role ?? null,
    pseudo: person.pseudo ?? null,
    bio: person.bio ?? null,
    avatar: person.avatarMedia?.url ?? null,
    email: person.email ?? null,
    profileData: normalizeProfileData(person.profileData),
    siteOwner: person.siteOwner ?? false,
  };
}

export interface PersonView {
  profile: PersonProfile;
  socialLinks: SocialLink[];
}

export function buildPersonView(person: PersonWithRelations): PersonView {
  const profile = buildPersonProfile(person);
  return {
    profile,
    socialLinks: buildSocialLinks(profile),
  };
}

export interface PersonSiteData {
  name: string;
  avatar: string;
  location?: string;
  role?: string;
  languages?: string[];
  email?: string;
  socials: SocialLink[];
}

export function buildPersonSiteData(
  view: PersonView | null,
  fallback: Partial<PersonSiteData> = {},
): PersonSiteData {
  const baseline: PersonSiteData = {
    name: fallback.name ?? "",
    avatar: fallback.avatar ?? "",
    location: fallback.location,
    role: fallback.role,
    languages: fallback.languages,
    email: fallback.email,
    socials: fallback.socials ?? [],
  };

  if (!view) {
    return baseline;
  }

  const profile = view.profile;
  const metadata = profile.profileData?.metadata ?? {};

  return {
    name: profile.pseudo ?? profile.fullName ?? baseline.name,
    avatar: profile.avatar ?? baseline.avatar,
    location: metadata.location ?? baseline.location,
    role: profile.role ?? baseline.role,
    languages: metadata.languages ?? baseline.languages,
    email: profile.email ?? baseline.email,
    socials: view.socialLinks.length ? view.socialLinks : baseline.socials,
  };
}
