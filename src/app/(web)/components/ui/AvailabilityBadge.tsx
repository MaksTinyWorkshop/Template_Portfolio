"use client";

import type { AvailabilityStatus } from "@/web/types";
import { Row, Text } from "@once-ui-system/core";
import { useAvailability } from "@/web/components/utils/AvailabilityContext";

const STATUS_CONFIG: Record<
  AvailabilityStatus,
  {
    label: string;
    dotColor: string;
    shadowColor: string;
  }
> = {
  available: {
    label: "Disponible pour de nouvelles missions",
    dotColor: "#22c55e", // Vert
    shadowColor: "rgba(34, 197, 94, 0.4)",
  },
  soon: {
    label: "Bientôt disponible",
    dotColor: "#eab308", // Jaune
    shadowColor: "rgba(234, 179, 8, 0.4)",
  },
  unavailable: {
    label: "Actuellement en mission",
    dotColor: "#ef4444", // Rouge
    shadowColor: "rgba(239, 68, 68, 0.4)",
  },
};

export function AvailabilityBadge() {
  const { availability, loading } = useAvailability();

  if (loading || !availability) {
    return null;
  }

  const config = STATUS_CONFIG[availability.status];

  return (
    <Row
      gap="8"
      paddingY="12"
      paddingX="16"
      radius="l"
      border="neutral-alpha-weak"
      background="neutral-alpha-weak"
      vertical="center"
      fitWidth
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: config.dotColor,
          boxShadow: `0 0 8px ${config.shadowColor}`,
          flexShrink: 0,
        }}
      />
      <Text variant="body-default-s" onBackground="neutral-strong">
        {config.label}
      </Text>
    </Row>
  );
}
