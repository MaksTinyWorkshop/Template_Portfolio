"use client";

import type { Availability, AvailabilityStatus } from "@/types";
import { Button, Card, Flex, Heading, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";

const STATUS_OPTIONS: Array<{
  value: AvailabilityStatus;
  label: string;
  icon: string;
}> = [
  { value: "available", label: "Disponible", icon: "🟢" },
  { value: "soon", label: "Bientôt disponible", icon: "🟡" },
  { value: "unavailable", label: "Non disponible", icon: "🔴" },
];

export function AvailabilityManager() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const response = await fetch("/api/availability");
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de la disponibilité:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateAvailability(status: AvailabilityStatus) {
    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      // Le cookie d'authentification est envoyé automatiquement par le navigateur
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour envoyer les cookies
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      const updatedData = await response.json();
      setAvailability(updatedData);
      setSuccess(true);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour de la disponibilité",
      );
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <Card
        padding="24"
        border="neutral-medium"
        background="neutral-weak"
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Flex direction="column" gap="16" horizontal="center">
          <Text variant="body-default-m">Chargement...</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card
      padding="24"
      border="neutral-medium"
      background="neutral-weak"
      fillWidth
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        paddingTop: "28px",
        paddingBottom: "28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Flex direction="column" gap="20" horizontal="center">
        {/* En-tête */}
        <Flex gap="12" vertical="center" horizontal="center" s={{ horizontal: "start" }}>
          <div style={{ fontSize: "28px" }}>💼</div>
          <Heading as="h3" variant="heading-strong-l">
            Statut de disponibilité
          </Heading>
        </Flex>

        {/* Statut actuel */}
        {availability && (
          <Flex direction="column" gap="8" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">
              Statut actuel :{" "}
              <strong>
                {STATUS_OPTIONS.find((opt) => opt.value === availability.status)?.label ||
                  "Inconnu"}
              </strong>
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Dernière mise à jour :{" "}
              {new Date(availability.lastUpdated).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Flex>
        )}

        {/* Boutons de changement de statut */}
        <Flex
          direction="row"
          gap="12"
          wrap
          horizontal="center"
          s={{ direction: "column", fillWidth: true }}
        >
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              label={`${option.icon} ${option.label}`}
              size="m"
              variant={availability?.status === option.value ? "primary" : "secondary"}
              disabled={updating || availability?.status === option.value}
              onClick={() => updateAvailability(option.value)}
            />
          ))}
        </Flex>

        {/* Messages de feedback */}
        {success && (
          <Flex
            padding="12"
            radius="m"
            background="brand-alpha-weak"
            border="brand-alpha-medium"
            horizontal="center"
          >
            <Text variant="body-default-s" onBackground="brand-strong">
              ✅ Disponibilité mise à jour avec succès !
            </Text>
          </Flex>
        )}

        {error && (
          <Flex
            padding="12"
            radius="m"
            background="danger-alpha-weak"
            border="danger-alpha-medium"
            horizontal="center"
          >
            <Text variant="body-default-s" onBackground="danger-strong">
              ⚠️ {error}
            </Text>
          </Flex>
        )}

        {/* Rappel de synchronisation */}
        <Flex
          padding="12"
          radius="m"
          background="warning-alpha-weak"
          border="warning-alpha-medium"
          horizontal="center"
        >
          <Text variant="body-default-xs" onBackground="warning-strong">
            💡 N'oubliez pas de synchroniser votre statut sur{" "}
            <a
              href="https://www.malt.fr/dashboard/profile"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Malt
            </a>
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
