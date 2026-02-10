import type { ProjectStatus } from "./domain/project";

export interface TeamMemberInput {
  name: string;
  role: string;
  avatar?: string | null;
  linkedIn?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  socials?: Array<{ name: string; url?: string | null }>;
  personId?: string;
  isSiteOwner?: boolean;
}

export interface ProjectAdminMetadata {
  title: string;
  summary: string;
  publishedAt: string;
  status: ProjectStatus;
  typeProjectTag: string[];
  featuredImage?: string;
  images: string[];
  team: TeamMemberInput[];
  link?: string;
  repository?: string;
}

export interface ProjectAdminPayload extends ProjectAdminMetadata {
  slug?: string;
  content: string;
}

export interface ProjectAdminListItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: ProjectStatus;
  typeProjectTag: string[];
}

export interface ProjectAdminDetail {
  slug: string;
  metadata: ProjectAdminMetadata;
  content: string;
}
