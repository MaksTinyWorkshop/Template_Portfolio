"use client";

import type { ProjectSummary } from "@/lib/modules/projects";
import { ProjectCard } from "@/web/components/ui/ProjectCard";
import { Column, Line } from "@once-ui-system/core";
import React from "react";

interface ClientProjectsProps {
  projects: ProjectSummary[];
}

export function ClientProjects({ projects }: ClientProjectsProps) {
  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {projects.map((project, index) => (
        <React.Fragment key={project.slug}>
          <ProjectCard
            priority={index < 2}
            href={`/work/${project.slug}`}
            images={project.gallery}
            title={project.title}
            description={project.summary ?? ""}
            content={project.content ?? ""}
            contributors={project.team.map((member) => ({
              name: member.name,
              avatar: member.avatar,
            }))}
            link={project.link ?? undefined}
            repository={project.repository ?? undefined}
            typeProjectTag={project.typeProjectTag}
          />
          {index < projects.length - 1 && <Line fillWidth />}
        </React.Fragment>
      ))}
    </Column>
  );
}
