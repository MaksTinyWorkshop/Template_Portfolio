import { listArticles } from "@/lib/modules/articles";
import { listProjects } from "@/lib/modules/projects";
import { baseURL, routes as routesConfig } from "@/web/resources";

export default async function sitemap() {
  const blogs = (await listArticles()).map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? new Date().toISOString(),
  }));

  const works = (await listProjects()).map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.publishedAt ?? new Date().toISOString(),
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...works];
}
