"use client";

import type { ArticleSummary } from "@/lib/modules/articles";
import type { Tag } from "@/lib/modules/articles/application/articles.dto";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { FilterByTags } from "@/web/components/ui/FilterByTags";
import { Grid } from "@once-ui-system/core";
import { useMemo, useState } from "react";
import Post from "./Post";

interface FilterablePostsProps {
  allTags: Tag[];
  articles: ArticleSummary[];
  sitePerson: PersonSiteData;
}

export function FilterablePosts({ allTags, articles, sitePerson }: FilterablePostsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredArticles = useMemo(() => {
    if (!selectedTags.length) return articles;
    return articles.filter((article) =>
      selectedTags.every((selectedTagSlug) =>
        article.tags.some((tag) => tag.slug === selectedTagSlug),
      ),
    );
  }, [articles, selectedTags]);

  return (
    <>
      <FilterByTags allTags={allTags} onFilterChange={setSelectedTags} />
      {filteredArticles.length > 0 && (
        <Grid columns="2" s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {filteredArticles.map((article) => (
            <Post
              key={article.slug}
              article={article}
              thumbnail
              direction="column"
              sitePerson={sitePerson}
            />
          ))}
        </Grid>
      )}
    </>
  );
}
