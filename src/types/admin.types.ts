/**
 * Types pour l'interface d'administration
 */

/**
 * Status de publication d'un contenu
 */
export type ContentStatus = "draft" | "scheduled" | "published";

/**
 * Métadonnées communes à tous les contenus (projets et articles)
 */
export interface BaseContentMetadata {
  title: string;
  summary: string;
  publishedAt: string;
  status: ContentStatus;
  lastModified?: string;
  author?: string;
  slug?: string;
}

/**
 * Membre d'équipe pour un projet
 */
export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  linkedIn?: string;
}

/**
 * Métadonnées spécifiques aux projets
 */
export interface ProjectMetadata extends BaseContentMetadata {
  typeProjectTag: string[];
  featuredImage?: string;
  images: string[];
  team: TeamMember[];
  link?: string;
  repository?: string;
}

/**
 * Métadonnées spécifiques aux articles de blog
 */
export interface PostMetadata extends BaseContentMetadata {
  image?: string;
  tag: string;
}

/**
 * Contenu complet (métadonnées + contenu MDX)
 */
export interface ContentWithBody<T extends BaseContentMetadata> {
  metadata: T;
  content: string;
  slug: string;
}

/**
 * Projet complet
 */
export type Project = ContentWithBody<ProjectMetadata>;

/**
 * Article complet
 */
export type Post = ContentWithBody<PostMetadata>;

/**
 * Données du formulaire de création/édition de projet
 */
export interface ProjectFormData {
  title: string;
  summary: string;
  publishedAt: string;
  status: ContentStatus;
  typeProjectTag: string[];
  featuredImage: string;
  images: string[];
  team: TeamMember[];
  link: string;
  repository: string;
  content: string;
}

/**
 * Données du formulaire de création/édition d'article
 */
export interface PostFormData {
  title: string;
  summary: string;
  publishedAt: string;
  status: ContentStatus;
  image: string;
  tag: string;
  content: string;
}

/**
 * Réponse API pour les opérations CRUD
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paramètres pour la création de contenu
 */
export interface CreateContentParams {
  slug: string;
  metadata: ProjectMetadata | PostMetadata;
  content: string;
}

/**
 * Paramètres pour la mise à jour de contenu
 */
export interface UpdateContentParams extends CreateContentParams {
  oldSlug?: string; // Pour gérer les changements de slug
}

/**
 * Paramètres pour la publication avec Git
 */
export interface PublishParams {
  slug: string;
  type: "project" | "post";
  commitMessage?: string;
}

/**
 * Statistiques du dashboard admin
 */
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
}
