import { listArticles } from "@/lib/modules/articles";
import { baseURL, blog, person } from "@/web/resources";
import { NextResponse } from "next/server";

// Force dynamic rendering - disable static generation during build
export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await listArticles();

  const sortedPosts = [...posts].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blog.title}</title>
    <link>${baseURL}/blog</link>
    <description>${blog.description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/api/rss" rel="self" type="application/rss+xml" />
    <managingEditor>${person.email || "noreply@example.com"} (${person.name})</managingEditor>
    <webMaster>${person.email || "noreply@example.com"} (${person.name})</webMaster>
    <image>
            <url>${baseURL}${person.avatar || "/images/avatars/avatar-default.jpg"}</url>

      <title>${blog.title}</title>
      <link>${baseURL}/blog</link>
    </image>
    ${sortedPosts
      .map((post) => {
        const published = new Date(
          post.publishedAt ?? new Date().toISOString(),
        ).toUTCString();
        const tags = post.tags
          .map((tag) => `<category>${tag}</category>`)
          .join("");
        const imageMarkup = post.image
          ? `<enclosure url="${baseURL}${post.image}" type="image/jpeg" />`
          : "";
        return `
    <item>
      <title>${post.title}</title>
      <link>${baseURL}/blog/${post.slug}</link>
      <guid>${baseURL}/blog/${post.slug}</guid>
      <pubDate>${published}</pubDate>
      <description><![CDATA[${post.summary ?? ""}]]></description>
      ${imageMarkup}
      ${tags}
      <author>${person.email || "noreply@example.com"} (${person.name})</author>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
