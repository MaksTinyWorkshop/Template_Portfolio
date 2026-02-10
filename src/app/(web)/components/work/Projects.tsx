import type { ProjectSummary } from "@/lib/modules/projects";
import { listProjects } from "@/lib/modules/projects";
import { ProjectCard } from "@/web/components/ui/ProjectCard";
import { Column, Line } from "@once-ui-system/core";
import { Fragment } from "react";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  filterTags?: string[];
  initialProjects?: ProjectSummary[];
}

export async function Projects({ range, exclude, filterTags, initialProjects }: ProjectsProps) {
  const baseProjects = initialProjects ?? (await listProjects());
  let candidateProjects = baseProjects;

  if (exclude?.length) {
    candidateProjects = candidateProjects.filter((project) => !exclude.includes(project.slug));
  }

  if (filterTags?.length) {
    candidateProjects = candidateProjects.filter((project) =>
      filterTags.every((tag) => project.typeProjectTag.includes(tag)),
    );
  }

  const sortedProjects = [...candidateProjects].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  const displayedProjects = range
    ? sortedProjects.slice(Math.max(range[0] - 1, 0), range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((project, index) => {
        const avatars = project.team.reduce<Array<{ src: string }>>((acc, member) => {
          if (member.avatar) {
            acc.push({ src: member.avatar });
          }
          return acc;
        }, []);

        return (
          <Fragment key={project.slug}>
            <ProjectCard
              priority={index < 2}
              href={`/work/${project.slug}`}
              images={project.images}
              title={project.title}
              description={project.summary ?? ""}
              content={project.content ?? ""}
              avatars={avatars}
              link={project.link ?? undefined}
              repository={project.repository ?? undefined}
              typeProjectTag={project.typeProjectTag}
            />
            {index < displayedProjects.length - 1 && <Line fillWidth />}
          </Fragment>
        );
      })}
    </Column>
  );
}
