import type { ArticleSummary } from "@/lib/modules/articles";
import { listArticles } from "@/lib/modules/articles";
import { Grid } from "@once-ui-system/core";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import Post from "./Post";

type Range = [number] | [number, number];

interface PostsProps {
  range?: Range;
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
  initialArticles?: ArticleSummary[];
  sitePerson: PersonSiteData;
}

export async function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
  initialArticles,
  sitePerson,
}: PostsProps) {
  const baseArticles = initialArticles ?? (await listArticles());
  let candidateArticles = baseArticles;

  if (exclude.length) {
    candidateArticles = candidateArticles.filter((article) => !exclude.includes(article.slug));
  }

  const sortedArticles = [...candidateArticles].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  const displayedArticles = range
    ? sortedArticles.slice(Math.max(range[0] - 1, 0), range[1] ?? sortedArticles.length)
    : sortedArticles;

  return (
    <>
      {displayedArticles.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {displayedArticles.map((article) => (
            <Post
              key={article.slug}
              article={article}
              thumbnail={thumbnail}
              direction={direction}
              sitePerson={sitePerson}
            />
          ))}
        </Grid>
      )}
    </>
  );
}
