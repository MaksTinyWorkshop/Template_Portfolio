import { QuickAction, StatsCard } from "@/web/components/admin/DashboardStats";
import { AvailabilityManager } from "@/web/components/admin/AvailabilityManager";
import type { DashboardStats } from "@/web/types";
import { listArticlesAdmin } from "@/lib/modules/articles";
import { listProjectsAdmin } from "@/lib/modules/projects";
import { Card, Flex, Heading, Text } from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = 'force-dynamic';

/**
 * Calcule les statistiques pour le dashboard
 */
async function getStats(): Promise<DashboardStats> {
  const projects = await listProjectsAdmin();
  const posts = await listArticlesAdmin();

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
          👋 Bienvenue !
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" align="center">
          Gérez vos projets et articles depuis votre panel d'administration.
        </Text>
      </Flex>

      <Flex direction="column" gap="32">
        {/* Statistiques */}
        <Flex direction="row" gap="16" horizontal="center">
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

        {/* Actions rapides */}
        <Flex
          fillWidth
          horizontal="center"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 280px))",
            gap: "16px",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <QuickAction
            icon="✨"
            title="Nouveau projet"
            description="Projet portfolio"
            href="/admin/projects/new"
          />
          <QuickAction
            icon="✍️"
            title="Nouvel article"
            description="Article de blog"
            href="/admin/blog/new"
          />
        </Flex>
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
              <div style={{ fontSize: "18px", marginTop: "2px" }}>🔄</div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                La publication crée automatiquement un <strong>commit Git</strong> avec rollback en
                cas d'échec
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
