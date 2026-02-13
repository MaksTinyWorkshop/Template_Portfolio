import { listArticles } from "@/lib/modules/articles";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import { Mailchimp } from "@/web/components";
import { FilterablePosts } from "@/web/components/blog/FilterablePosts";
import { baseURL, blog } from "@/web/resources";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default async function Blog() {
  const sitePerson: PersonSiteData = await getSitePersonData();
  const articles = await listArticles();

  const sortedArticles = [...articles].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  // Collecter tous les tags uniques avec leurs couleurs
  const tagsMap = new Map<string, { slug: string; name: string; color: string | null }>();
  for (const article of sortedArticles) {
    for (const tag of article.tags) {
      if (!tagsMap.has(tag.slug)) {
        tagsMap.set(tag.slug, { slug: tag.slug, name: tag.name, color: tag.color });
      }
    }
  }
  const allTags = Array.from(tagsMap.values());

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: sitePerson.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        <FilterablePosts allTags={allTags} articles={sortedArticles} sitePerson={sitePerson} />
        <Mailchimp marginBottom="l" />
      </Column>
    </Column>
  );
}
