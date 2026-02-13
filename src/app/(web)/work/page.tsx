import { listProjects } from "@/lib/modules/projects";
import { FilterableProjects } from "@/web/components/work/FilterableProjects";
import { about, baseURL, work } from "@/web/resources";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

export default async function Work() {
  const allProjects = await listProjects();
  const sitePerson: PersonSiteData = await getSitePersonData();

  const sortedProjects = [...allProjects].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  // Collecter tous les tags uniques avec leurs couleurs
  const tagsMap = new Map<string, { slug: string; name: string; color: string | null }>();
  for (const project of sortedProjects) {
    for (const tag of project.typeProjectTag) {
      if (!tagsMap.has(tag.slug)) {
        tagsMap.set(tag.slug, { slug: tag.slug, name: tag.name, color: tag.color });
      }
    }
  }
  const allTags = Array.from(tagsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: sitePerson.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <FilterableProjects allTags={allTags} projects={sortedProjects} />
    </Column>
  );
}
