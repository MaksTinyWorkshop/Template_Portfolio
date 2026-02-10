import { BaseContentItem } from "@/components/admin/ContentList";

// Type spécifique pour les projets
export interface Project extends BaseContentItem {
  typeProjectTag: string[];
}

// Type spécifique pour les articles de blog
export interface Post extends BaseContentItem {
  tag: string;
}
