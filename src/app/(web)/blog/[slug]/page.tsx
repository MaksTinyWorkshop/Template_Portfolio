import type { ArticleSummary } from "@/lib/modules/articles";
import { getArticleBySlug } from "@/lib/modules/articles";
import { CustomMDX, ScrollToHash } from "@/web/components";
import { Posts } from "@/web/components/blog/Posts";
import { ShareSection } from "@/web/components/blog/ShareSection";
import { about, baseURL, blog } from "@/web/resources";
import { formatBlogDate } from "@/lib/utils/formatDate";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import {
  Avatar,
  Column,
  Heading,
  HeadingNav,
  Icon,
  Line,
  Media,
  Meta,
  Row,
  Schema,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Force dynamic rendering - disable static generation during build
// This prevents DB connection attempts during Docker build
export const dynamic = 'force-dynamic';

const normalizeSlug = (slugParam?: string | string[]) =>
  Array.isArray(slugParam) ? slugParam.join("/") : (slugParam ?? "");

const resolveArticleImage = (article: ArticleSummary) => article.image;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slug = normalizeSlug(routeParams.slug).trim();

  if (!slug) {
    return {};
  }

  try {
    const article = await getArticleBySlug(slug);
    const image =
      resolveArticleImage(article) || `/api/og/generate?title=${encodeURIComponent(article.title)}`;

    return Meta.generate({
      title: article.title,
      description: article.summary ?? blog.description,
      baseURL,
      image,
      path: `${blog.path}/${article.slug}`,
    });
  } catch {
    return {};
  }
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const sitePerson: PersonSiteData = await getSitePersonData();
  const findSocialUrl = (links: PersonSiteData["socials"], key: string) =>
    links.find((link) => link.name.toLowerCase() === key)?.url;
  const linkedInUrl = findSocialUrl(sitePerson.socials, "linkedin");
  const avatarUrl = sitePerson.avatar;
  const authorName = sitePerson.name;
  const routeParams = await params;
  const slug = normalizeSlug(routeParams.slug).trim();

  if (!slug) {
    notFound();
  }

  let article: ArticleSummary;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  const articleImage = resolveArticleImage(article);
  const formattedDate = article.publishedAt ? formatBlogDate(article.publishedAt) : "Date inconnue";

  return (
    <Row fillWidth>
      <Row maxWidth={12} m={{ hide: true }} />
      <Row fillWidth horizontal="center">
        <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
          <Schema
            as="blogPosting"
            baseURL={baseURL}
            path={`${blog.path}/${article.slug}`}
            title={article.title}
            description={article.summary ?? blog.description}
            datePublished={article.publishedAt ?? undefined}
            dateModified={article.publishedAt ?? undefined}
            image={articleImage || `/api/og/generate?title=${encodeURIComponent(article.title)}`}
            author={{
              name: sitePerson.name,
              url: `${baseURL}${about.path}`,
              image: `${baseURL}${sitePerson.avatar}`,
            }}
          />
          <Column maxWidth="s" gap="16" horizontal="center" align="center">
            <SmartLink href="/blog">
              <Text variant="label-strong-m">Blog</Text>
            </SmartLink>
            <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
              {formattedDate}
            </Text>
            <Heading variant="display-strong-m">{article.title}</Heading>
            {article.summary && (
              <Text
                variant="body-default-l"
                onBackground="neutral-weak"
                align="center"
                style={{ fontStyle: "italic" }}
              >
                {article.summary}
              </Text>
            )}
          </Column>
          <Row marginBottom="32" horizontal="center">
            <Row gap="16" vertical="center">
              {avatarUrl ? (
                <Avatar size="s" src={avatarUrl} />
              ) : (
                <Icon name="person" onBackground="brand-weak" />
              )}
              {linkedInUrl ? (
                <SmartLink href={linkedInUrl} target="_blank" rel="noreferrer noopener">
                  <Text variant="label-default-m" onBackground="brand-weak">
                    {authorName}
                  </Text>
                </SmartLink>
              ) : (
                <Text variant="label-default-m" onBackground="brand-weak">
                  {authorName}
                </Text>
              )}
            </Row>
          </Row>
          {articleImage && (
            <Media
              src={articleImage}
              alt={article.title}
              aspectRatio="16/9"
              priority
              sizes="(min-width: 768px) 100vw, 768px"
              border="neutral-alpha-weak"
              radius="l"
              marginTop="12"
              marginBottom="8"
            />
          )}
          <Column as="article" maxWidth="s">
            <CustomMDX source={article.content ?? ""} />
          </Column>

          <ShareSection title={article.title} url={`${baseURL}${blog.path}/${article.slug}`} />

          <Column fillWidth gap="40" horizontal="center" marginTop="40">
            <Line maxWidth="40" />
            <Text as="h2" id="recent-posts" variant="heading-strong-xl" marginBottom="24">
              Recent posts
            </Text>
            <Posts
              exclude={[article.slug]}
              range={[1, 2]}
              columns="2"
              thumbnail
              direction="column"
              sitePerson={sitePerson}
            />
          </Column>
          <ScrollToHash />
        </Column>
      </Row>
      <Column
        maxWidth={12}
        paddingLeft="40"
        fitHeight
        position="sticky"
        top="80"
        gap="16"
        m={{ hide: true }}
      >
        <HeadingNav fitHeight />
      </Column>
    </Row>
  );
}
