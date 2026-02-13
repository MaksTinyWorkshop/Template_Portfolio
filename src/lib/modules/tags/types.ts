import type { TagCategory } from "@prisma/client";

export interface TagAdminListItem {
  id: string;
  slug: string;
  name: string;
  category: TagCategory;
  description: string | null;
  color: string | null;
  _count: {
    articleTags: number;
    projectTags: number;
  };
}

export interface TagAdminPayload {
  name?: string;
  category?: TagCategory;
  description?: string;
  color?: string;
}

export interface TagAdminDetail {
  id: string;
  slug: string;
  name: string;
  category: TagCategory;
  description: string | null;
  color: string | null;
}
