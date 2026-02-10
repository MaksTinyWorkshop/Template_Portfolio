import { Mailchimp } from "@/web/components";
import { Posts } from "@/web/components/blog/Posts";
import { baseURL, blog } from "@/web/resources";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { Column, Heading, Meta, Schema } from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = 'force-dynamic';

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
        <Posts range={[1, 1]} thumbnail sitePerson={sitePerson} />
        <Posts range={[2, 3]} columns="2" thumbnail direction="column" sitePerson={sitePerson} />
        <Mailchimp marginBottom="l" />
        <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
          Posts récents
        </Heading>
        <Posts range={[4]} columns="2" sitePerson={sitePerson} />
      </Column>
    </Column>
  );
}
