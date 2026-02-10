"use client";

import { Flex, Text, Card, Heading } from "@once-ui-system/core";
import Link from "next/link";

interface StatsCardProps {
  icon: string;
  title: string;
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  href: string;
  color: "accent" | "brand" | "success" | "warning";
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
        style={{
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: "12px",
          height: "100%",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
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
        <Flex direction="column" gap="20">
          <Flex horizontal="between" vertical="center">
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

            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1,
              }}
            >
              {total}
            </div>
          </Flex>

          <Flex direction="column" gap="8">
            <Flex horizontal="between" vertical="center">
              <Flex gap="8" vertical="center">
                <div style={{ fontSize: "16px" }}>✅</div>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Publiés
                </Text>
              </Flex>
              <Text variant="body-strong-s">{published}</Text>
            </Flex>

            <Flex horizontal="between" vertical="center">
              <Flex gap="8" vertical="center">
                <div style={{ fontSize: "16px" }}>📝</div>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Brouillons
                </Text>
              </Flex>
              <Text variant="body-strong-s">{draft}</Text>
            </Flex>

            {scheduled > 0 && (
              <Flex horizontal="between" vertical="center">
                <Flex gap="8" vertical="center">
                  <div style={{ fontSize: "16px" }}>⏰</div>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Planifiés
                  </Text>
                </Flex>
                <Text variant="body-strong-s">{scheduled}</Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export function QuickAction({ icon, title, description, href }: QuickActionProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block", width: "280px" }}>
      <Card
        padding="24"
        border="neutral-medium"
        background="neutral-weak"
        style={{
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "200px",
          width: "280px",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.backgroundColor = "var(--accent-background-weak)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.backgroundColor = "var(--neutral-background-weak)";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.04)";
        }}
      >
        <Flex direction="column" gap="16">
          <div
            style={{
              fontSize: "48px",
              lineHeight: 1,
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            {icon}
          </div>
          <Heading as="h4" variant="heading-strong-m">
            {title}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        </Flex>
      </Card>
    </Link>
  );
}
