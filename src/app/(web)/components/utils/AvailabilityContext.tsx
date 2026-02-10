"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Availability, AvailabilityStatus } from "@/web/types";

type AvailabilityContextValue = {
  availability: Availability | null;
  loading: boolean;
  error: string | null;
  refreshAvailability: () => Promise<void>;
  updateAvailability: (status: AvailabilityStatus) => Promise<Availability>;
};

const AvailabilityContext = createContext<AvailabilityContextValue | undefined>(undefined);

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/availability");
      if (!response.ok) {
        throw new Error("Impossible de récupérer la disponibilité");
      }
      const data: Availability = await response.json();
      setAvailability(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      console.error("Erreur lors de la récupération de la disponibilité :", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const refreshAvailability = useCallback(() => fetchAvailability(), [fetchAvailability]);

  const updateAvailability = useCallback(async (status: AvailabilityStatus) => {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Échec de la mise à jour de la disponibilité");
      }

      const updated: Availability = await response.json();
      setAvailability(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      console.error("Erreur lors de la mise à jour de la disponibilité :", err);
      throw new Error(message);
    }
  }, []);

  const value = useMemo(
    () => ({
      availability,
      loading,
      error,
      refreshAvailability,
      updateAvailability,
    }),
    [availability, loading, error, refreshAvailability, updateAvailability],
  );

  return <AvailabilityContext.Provider value={value}>{children}</AvailabilityContext.Provider>;
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error("useAvailability doit être utilisé avec un AvailabilityProvider");
  }
  return context;
}
