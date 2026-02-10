"use client";

import type { ProjectSummary } from "@/lib/modules/projects";
import { ClientProjects } from "@/web/components/work/ClientProjects";
import { ProjectFilter } from "@/web/components/work/ProjectFilter";
import { Column } from "@once-ui-system/core";
import { useMemo, useState } from "react";

interface FilterableProjectsProps {
  allTags: string[];
  projects: ProjectSummary[];
}

export function FilterableProjects({ allTags, projects }: FilterableProjectsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleFilterChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  // Filtrer les projets côté client
  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) {
      return projects;
    }

    return projects.filter((project) =>
      selectedTags.every((tag) => project.typeProjectTag.includes(tag)),
    );
  }, [selectedTags, projects]);

  return (
    <Column fillWidth>
      <ProjectFilter allTags={allTags} onFilterChange={handleFilterChange} />
      <ClientProjects projects={filteredProjects} />
    </Column>
  );
}
