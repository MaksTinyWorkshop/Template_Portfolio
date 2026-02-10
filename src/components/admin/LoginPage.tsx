"use client";

import { useState } from "react";
import {
  Column,
  Flex,
  Heading,
  Text,
  PasswordInput,
  Button,
  Card,
} from "@once-ui-system/core";

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      fillWidth
      fillHeight
      horizontal="center"
      vertical="center"
      style={{
        minHeight: "calc(100vh - 96px)", // Hauteur complète moins le header
        padding: "20px",
      }}
    >
      <Column maxWidth={24} gap="40" center style={{ width: "100%" }}>
        <Flex direction="column" gap="16" horizontal="center">
          <div
            style={{
              fontSize: "64px",
              marginBottom: "8px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🔐
          </div>
          <Heading align="center" variant="display-strong-xl">
            Admin Panel
          </Heading>
          <Text
            align="center"
            variant="body-default-l"
            onBackground="neutral-weak"
            style={{ maxWidth: "400px" }}
          >
            Accès sécurisé au panel d'administration
          </Text>
        </Flex>

        <Card
          padding="40"
          border="neutral-medium"
          background="surface"
          style={{
            width: "100%",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="24">
              <PasswordInput
                id="admin-password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                errorMessage={error}
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="l"
                fillWidth
                disabled={loading || !password}
              >
                {loading ? "🔄 Connexion..." : "🚀 Se connecter"}
              </Button>
            </Flex>
          </form>
        </Card>
      </Column>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Flex>
  );
}
