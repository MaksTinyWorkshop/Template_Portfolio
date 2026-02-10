"use client";

import { useState, useMemo } from "react";
import { Column } from "@once-ui-system/core";
import { ClientProjects } from "@/components/work/ClientProjects";
import { ProjectFilter } from "@/components/work/ProjectFilter";

type ProjectMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  images: string[];
  typeProjectTag?: string[];
  team?: Array<{
    name: string;
    role: string;
    avatar: string;
    linkedIn: string;
  }>;
  link?: string;
};

type Project = {
  slug: string;
  metadata: ProjectMetadata;
  content: string;
};

interface FilterableProjectsProps {
  allTags: string[];
  allProjects: Project[];
}

export function FilterableProjects({ allTags, allProjects }: FilterableProjectsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleFilterChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  // Filtrer les projets côté client
  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) {
      return allProjects;
    }

    return allProjects.filter((post) =>
      selectedTags.every((tag) => post.metadata.typeProjectTag?.includes(tag)),
    );
  }, [selectedTags, allProjects]);

  return (
    <Column fillWidth>
      <ProjectFilter allTags={allTags} onFilterChange={handleFilterChange} />
      <ClientProjects projects={filteredProjects} />
    </Column>
  );
}
