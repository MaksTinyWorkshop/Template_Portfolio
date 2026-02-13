import { listArticlesAdmin } from "@/lib/modules/articles";
import { listAssetsAdmin } from "@/lib/modules/assets";
import { listPersonsAdmin } from "@/lib/modules/person";
import { listProjectsAdmin } from "@/lib/modules/projects";
import { listTagsAdmin } from "@/lib/modules/tags";
import { AvailabilityManager } from "@/web/components/admin/AvailabilityManager";
import { StatsCard } from "@/web/components/admin/DashboardStats";
import type { DashboardStats } from "@/web/types";
import { Card, Flex, Heading, Text } from "@once-ui-system/core";
import Link from "next/link";
import styles from "./AdminDashboard.module.scss";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

/**
 * Calcule les statistiques pour le dashboard
 */
async function getStats(): Promise<DashboardStats> {
  const projects = await listProjectsAdmin();
  const posts = await listArticlesAdmin();
  const tags = await listTagsAdmin();
  const persons = await listPersonsAdmin();
  const assets = await listAssetsAdmin();

  return {
    projects: {
      total: projects.length,
      published: projects.filter((p) => p.status === "published").length,
      draft: projects.filter((p) => p.status === "draft").length,
      scheduled: projects.filter((p) => p.status === "scheduled").length,
    },
    posts: {
      total: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
    },
    tags: {
      total: tags.length,
    },
    persons: {
      total: persons.length,
    },
    assets: {
      total: assets.items.length,
    },
  };
}

/**
 * Page Dashboard Admin
 */
export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <Flex direction="column" fillWidth gap="40">
      {/* En-tête centré */}
      <Flex direction="column" gap="12" horizontal="center">
        <Heading as="h1" variant="display-strong-xl" align="center">
          👋 Ton Dashboard
        </Heading>
      </Flex>

      {/* Panel Statistiques Articles & Projets */}
      <Flex direction="column" gap="20" className={styles.panel}>
        <StatsCard
          icon="📁"
          title="Projets"
          total={stats.projects.total}
          published={stats.projects.published}
          draft={stats.projects.draft}
          scheduled={stats.projects.scheduled}
          href="/admin/projects"
          color="accent"
        />
        <StatsCard
          icon="📰"
          title="Articles"
          total={stats.posts.total}
          published={stats.posts.published}
          draft={stats.posts.draft}
          scheduled={stats.posts.scheduled}
          href="/admin/blog"
          color="brand"
        />
      </Flex>

      {/* Panel Gestion Tags & Teams */}
      <Flex direction="column" gap="20" className={`${styles.panel} ${styles.panelGestion}`}>
        <StatsCard
          icon="🏷️"
          title="Tags"
          published={0}
          draft={0}
          scheduled={0}
          total={stats.tags.total}
          href="/admin/tags"
          color="success"
          minHeight={100}
        />
        <StatsCard
          icon="👥"
          title="Personnes"
          published={0}
          draft={0}
          scheduled={0}
          total={stats.persons.total}
          href="/admin/persons"
          color="warning"
          minHeight={100}
        />
        <StatsCard
          icon="🗂️"
          title="Assets"
          published={0}
          draft={0}
          scheduled={0}
          total={stats.assets.total}
          href="/admin/assets"
          color="accent"
          minHeight={100}
        />
      </Flex>

      {/* Gestion de la disponibilité freelance */}
      <AvailabilityManager />

      {/* Informations système */}
      <Card
        padding="24"
        border="neutral-medium"
        background="neutral-weak"
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          paddingTop: "28px",
          paddingBottom: "28px",
          margin: "0 auto",
        }}
      >
        <Flex direction="column" gap="20" horizontal="center">
          <Flex gap="12" vertical="center" horizontal="center" s={{ horizontal: "start" }}>
            <div style={{ fontSize: "28px" }}>ℹ️</div>
            <Heading as="h3" variant="heading-strong-l">
              Informations système
            </Heading>
          </Flex>

          <Flex direction="column" gap="12">
            <Flex gap="12" vertical="start">
              <div style={{ fontSize: "25px", marginTop: "2px" }}>📘</div>
              <Link href="/admin/api-docs">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  API Docs (Swagger)
                </Text>
              </Link>
            </Flex>
            <Flex gap="12" vertical="start">
              <div style={{ fontSize: "18px", marginTop: "2px" }}>📝</div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Les contenus en <strong>brouillon</strong> ne sont pas visibles sur le site public
              </Text>
            </Flex>
            <Flex gap="12" vertical="start">
              <div style={{ fontSize: "18px", marginTop: "2px" }}>⏰</div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Les contenus <strong>planifiés</strong> seront publiés automatiquement à la date
                définie
              </Text>
            </Flex>
            <Flex gap="12" vertical="start">
              <div style={{ fontSize: "18px", marginTop: "2px" }}>🖼️</div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Les images sont stockées localement avec <strong>préfixes automatiques</strong>{" "}
                (/images/projects, /images/articles)
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
