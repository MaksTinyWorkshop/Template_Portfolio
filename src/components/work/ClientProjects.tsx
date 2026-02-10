"use client";

import { Column, Line } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import React from "react";

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
  repository?: string;
};

type Project = {
  slug: string;
  metadata: ProjectMetadata;
  content: string;
};

interface ClientProjectsProps {
  projects: Project[];
}

export function ClientProjects({ projects }: ClientProjectsProps) {
  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {projects.map((post, index) => (
        <React.Fragment key={post.slug}>
          <ProjectCard
            priority={index < 2}
            href={`/work/${post.slug}`}
            images={post.metadata.images}
            title={post.metadata.title}
            description={post.metadata.summary}
            content={post.content}
            avatars={post.metadata.team?.map((member) => ({ src: member.avatar })) || []}
            link={post.metadata.link || ""}
            repository={post.metadata.repository}
            typeProjectTag={post.metadata.typeProjectTag}
          />
          {index < projects.length - 1 && <Line fillWidth />}
        </React.Fragment>
      ))}
    </Column>
  );
}
