"use client";

import type { Availability, AvailabilityStatus } from "@/types";
import { Row, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";

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
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch("/api/availability");
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la disponibilité:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, []);

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
