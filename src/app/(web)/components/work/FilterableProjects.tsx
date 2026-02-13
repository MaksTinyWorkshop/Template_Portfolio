"use client";

import type { ProjectSummary } from "@/lib/modules/projects";
import type { Tag } from "@/lib/modules/projects/application/projects.dto";
import { ClientProjects } from "@/web/components/work/ClientProjects";
import { FilterByTags } from "@/web/components/ui/FilterByTags";
import { Column } from "@once-ui-system/core";
import { useMemo, useState } from "react";

interface FilterableProjectsProps {
  allTags: Tag[];
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
      selectedTags.every((selectedTagSlug) =>
        project.typeProjectTag.some((tag) => tag.slug === selectedTagSlug),
      ),
    );
  }, [selectedTags, projects]);

  return (
    <Column fillWidth>
      <FilterByTags allTags={allTags} onFilterChange={handleFilterChange} />
      <ClientProjects projects={filteredProjects} />
    </Column>
  );
}
