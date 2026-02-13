import type { ArticleAdminMetadata } from "@/lib/contracts/articles";
import type { ProjectAdminMetadata } from "@/lib/contracts/projects";
// === contrats partagés ===
export type { ApiResponse } from "@/lib/contracts/api";
export type {
  ArticleAdminDetail,
  ArticleAdminListItem,
  ArticleAdminMetadata,
  ArticleAdminPayload,
} from "@/lib/contracts/articles";
export type { ContentStatus } from "@/lib/contracts/content";
export type {
  ProjectAdminDetail,
  ProjectAdminListItem,
  ProjectAdminMetadata,
  ProjectAdminPayload,
  ProjectTeamMember,
} from "@/lib/contracts/projects";
export type {
  PostFormData,
  ProjectFormData,
  TeamMemberData,
} from "@/lib/contracts/validations";

export type PostMetadata = ArticleAdminMetadata & { slug?: string };
export type ProjectMetadata = ProjectAdminMetadata & { slug?: string };

// === types front uniquement ===
export interface ContentWithBody<T> {
  metadata: T;
  content: string;
  slug: string;
}

export type Project = ContentWithBody<ProjectAdminMetadata>;
export type Post = ContentWithBody<ArticleAdminMetadata>;

export interface DashboardStats {
  projects: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  posts: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  tags: {
    total: number;
  };
  persons: {
    total: number;
  };
  assets: {
    total: number;
  };
}

export * from "./config.types";
export * from "./content";
export * from "./content.types";
