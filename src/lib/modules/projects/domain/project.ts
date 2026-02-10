export const PROJECT_STATUSES = ["draft", "scheduled", "published"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ProjectTeamMember {
  name: string;
  role: string | null;
  avatar: string | null;
  linkedIn: string | null;
}

export interface ProjectGalleryUsage {
  heroImage: string | null;
  gallery: string[];
}
