import { getPosts } from "@/utils/utils";
import { Column, Line } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import React from "react";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  filterTags?: string[];
}

export function Projects({ range, exclude, filterTags }: ProjectsProps) {
  let allProjects = getPosts(["data", "projects"]);

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  // Filter by tags
  if (filterTags && filterTags.length > 0) {
    allProjects = allProjects.filter((post) =>
      filterTags.every((tag) => post.metadata.typeProjectTag?.includes(tag)),
    );
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
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
          {index < displayedProjects.length - 1 && <Line fillWidth />}
        </React.Fragment>
      ))}
    </Column>
  );
}
