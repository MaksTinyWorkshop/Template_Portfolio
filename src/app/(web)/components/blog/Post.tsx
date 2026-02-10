"use client";

import type { ArticleSummary } from "@/lib/modules/articles";
import { formatBlogDate } from "@/lib/utils/formatDate";
import { Avatar, Card, Column, Media, Row, Text } from "@once-ui-system/core";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";

interface PostProps {
  article: ArticleSummary;
  thumbnail: boolean;
  direction?: "row" | "column";
  sitePerson: PersonSiteData;
}

export default function Post({ article, thumbnail, direction, sitePerson }: PostProps) {
  const formattedDate = article.publishedAt ? formatBlogDate(article.publishedAt) : "Date inconnue";

  return (
    <Card
      fillWidth
      href={`/blog/${article.slug}`}
      transition="micro-medium"
      direction={direction}
      border="transparent"
      background="transparent"
      padding="4"
      radius="l-4"
      gap={direction === "column" ? undefined : "24"}
      s={{ direction: "column" }}
    >
      {article.image && thumbnail && (
        <Media
          priority
          sizes="(max-width: 768px) 100vw, 640px"
          border="neutral-alpha-weak"
          cursor="interactive"
          radius="l"
          src={article.image}
          alt={`Thumbnail of ${article.title}`}
          aspectRatio="16 / 9"
        />
      )}
      <Row fillWidth>
        <Column maxWidth={28} paddingY="24" paddingX="l" gap="20" vertical="center">
          <Row gap="24" vertical="center">
            <Row vertical="center" gap="16">
              <Avatar src={sitePerson.avatar} size="s" />
              <Text variant="label-default-s">{sitePerson.name}</Text>
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {formattedDate}
            </Text>
          </Row>
          <Text variant="heading-strong-l" wrap="balance">
            {article.title}
          </Text>
          {article.tags.length > 0 && (
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {article.tags.join(", ")}
            </Text>
          )}
        </Column>
      </Row>
    </Card>
  );
}
