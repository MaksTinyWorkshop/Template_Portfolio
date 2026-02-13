"use client";

import { Card, Flex, Heading, Text } from "@once-ui-system/core";
import Link from "next/link";
import styles from "./DashboardStats.module.scss";

interface StatsCardProps {
  icon: string;
  title: string;
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  href: string;
  color: "accent" | "brand" | "success" | "warning";
  minHeight?: number;
}

export function StatsCard({
  icon,
  title,
  total,
  published,
  draft,
  scheduled,
  href,
  color,
  minHeight,
}: StatsCardProps) {
  const colorMap = {
    accent: {
      bg: "var(--accent-background-weak)",
      border: "var(--accent-border-medium)",
      text: "var(--accent-text-strong)",
    },
    brand: {
      bg: "var(--brand-background-weak)",
      border: "var(--brand-border-medium)",
      text: "var(--brand-text-strong)",
    },
    success: {
      bg: "var(--success-background-weak)",
      border: "var(--success-border-medium)",
      text: "var(--success-text-strong)",
    },
    warning: {
      bg: "var(--warning-background-weak)",
      border: "var(--warning-border-medium)",
      text: "var(--warning-text-strong)",
    },
  };

  const colors = colorMap[color];

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <Card
        padding="24"
        border="neutral-medium"
        background="surface"
        className={styles.card}
        style={{
          borderLeft: `4px solid ${colors.border}`,
          minHeight,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
          e.currentTarget.style.borderLeftWidth = "6px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
          e.currentTarget.style.borderLeftWidth = "4px";
        }}
      >
        <Flex direction="column" gap="20" fillWidth>
          <Flex horizontal="around" vertical="center">
            <Flex gap="12" vertical="center">
              <div
                style={{
                  fontSize: "32px",
                  lineHeight: 1,
                }}
              >
                {icon}
              </div>
              <Heading as="h3" variant="heading-strong-m">
                {title}
              </Heading>
            </Flex>

            {title !== "Assets" && (
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  paddingLeft: "12px",
                  color: colors.text,
                  lineHeight: 1,
                }}
              >
                {total}
              </div>
            )}
          </Flex>

          {title === "Projets" || title === "Articles" ? (
            <Flex direction="row" gap="8" fillWidth horizontal="around">
              <Flex horizontal="around" vertical="center">
                <Flex gap="4" vertical="center">
                  <div style={{ fontSize: "16px" }}>✅</div>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Publiés
                  </Text>
                </Flex>
                <Text variant="body-strong-s" paddingLeft="4">
                  {published}
                </Text>
              </Flex>

              <Flex horizontal="around" vertical="center">
                <Flex gap="4" vertical="center">
                  <div style={{ fontSize: "16px" }}>📝</div>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Brouillons
                  </Text>
                </Flex>
                <Text variant="body-strong-s" paddingLeft="4">
                  {draft}
                </Text>
              </Flex>

              {scheduled > 0 && (
                <Flex horizontal="around" vertical="center">
                  <Flex gap="4" vertical="center">
                    <div style={{ fontSize: "16px" }}>⏰</div>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Planifiés
                    </Text>
                  </Flex>
                  <Text variant="body-strong-s" paddingLeft="4">
                    {scheduled}
                  </Text>
                </Flex>
              )}
            </Flex>
          ) : null}
        </Flex>
      </Card>
    </Link>
  );
}
