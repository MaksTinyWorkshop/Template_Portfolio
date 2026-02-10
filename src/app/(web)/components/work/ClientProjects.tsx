"use client";

import type { IconName } from "@/web/resources/icons";
import type { ProjectSummary } from "@/lib/modules/projects";
import { ProjectCard } from "@/web/components/ui/ProjectCard";
import { Column, Line } from "@once-ui-system/core";
import React from "react";

interface ClientProjectsProps {
  projects: ProjectSummary[];
}

const buildAvatarEntry = (memberAvatar?: string | null) => {
  if (memberAvatar) {
    return { src: memberAvatar };
  }
  return null;
};

export function ClientProjects({ projects }: ClientProjectsProps) {
  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {projects.map((project, index) => (
        <React.Fragment key={project.slug}>
          <ProjectCard
            priority={index < 2}
            href={`/work/${project.slug}`}
            images={project.images}
            title={project.title}
            description={project.summary ?? ""}
            content={project.content ?? ""}
            avatars={project.team
              .map((member) => buildAvatarEntry(member.avatar))
              .filter((avatar): avatar is { src: string } => Boolean(avatar))}
            link={project.link ?? ""}
            repository={project.repository ?? undefined}
            typeProjectTag={project.typeProjectTag}
          />
          {index < projects.length - 1 && <Line fillWidth />}
        </React.Fragment>
      ))}
    </Column>
  );
}
