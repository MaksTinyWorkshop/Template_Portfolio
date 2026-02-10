import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { FilterableProjects } from "@/components/work/FilterableProjects";
import { getPosts } from "@/utils/utils";

export async function generateMetadata() {
  return Meta.generate({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

export default function Work() {
  // Récupérer tous les projets et tags côté serveur
  const allProjects = getPosts(["data", "projects"]);

  // Trier par date
  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  // Extraire les tags uniques
  const tagsSet = new Set<string>();
  for (const post of sortedProjects) {
    if (post.metadata.typeProjectTag) {
      for (const tag of post.metadata.typeProjectTag) {
        tagsSet.add(tag);
      }
    }
  }
  const allTags = Array.from(tagsSet).sort();

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
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <FilterableProjects allTags={allTags} allProjects={sortedProjects} />
    </Column>
  );
}
