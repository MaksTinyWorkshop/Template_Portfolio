"use client";

import { Text } from "@once-ui-system/core";
import { ContentList, type ContentConfig } from "./ContentList";
import type { Project } from "@/web/types/content";

interface ProjectsListProps {
  initialProjects: Project[];
}

const projectConfig: ContentConfig<Project> = {
  type: "project",
  apiRoute: "/api/admin/projects",
  editRoute: (slug) => `/admin/projects/${slug}`,
  newRoute: "/admin/projects/new",
  emptyTitle: "Aucun projet",
  emptyMessage: "Créez votre premier projet pour commencer.",
  newButtonLabel: "➕ Nouveau projet",
  deleteConfirmMessage: (slug) => `Êtes-vous sûr de vouloir supprimer le projet "${slug}" ?`,
  publishConfirmMessage: (title) => `Publier le projet "${title}" ? Cela créera un commit Git.`,
  deleteSuccessMessage: "Projet supprimé avec succès",
  publishSuccessMessage: "Projet publié avec succès !",
  renderTags: (project) => (
    <Text variant="label-default-m" onBackground="neutral-weak">
      🏷️ {project.typeProjectTag.join(", ")}
    </Text>
  ),
};

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  return <ContentList initialItems={initialProjects} config={projectConfig} />;
}
