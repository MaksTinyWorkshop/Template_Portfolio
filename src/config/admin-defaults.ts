import type { TeamMemberData } from "@/lib/validations";
import { person, social } from "@/resources";
/**
 * Tags de projets normés (utilisables dans le filtre)
 */
export const PROJECT_TAGS = [
  "Web",
  "Mobile",
  "SaaS",
  "E-commerce",
  "Dashboard",
  "API",
  "Full-stack",
  "Frontend",
  "Backend",
  "Design System",
  "CMS",
  "Métier",
  "IA",
  "Data",
  "DevOps",
  "Open Source",
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];

/**
 * Membre d'équipe par défaut : Max (toi)
 */
export const DEFAULT_TEAM_MEMBER: TeamMemberData = {
  name: person.name,
  role: person.role,
  avatar: person.avatar,
  linkedIn: social.find((s) => s.name === "LinkedIn")?.link || "",
};

/**
 * Tags d'articles (libres, pas de normalisation)
 */
export const ARTICLE_TAG_SUGGESTIONS = [
  "Tech",
  "Design",
  "Dev",
  "Product",
  "Business",
  "Tutorial",
  "Opinion",
  "News",
] as const;
