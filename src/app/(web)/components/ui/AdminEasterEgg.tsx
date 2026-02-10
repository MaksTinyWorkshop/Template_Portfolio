"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Easter egg pour accéder à l'admin via triple-clic/tap
 * Compatible desktop et mobile
 */
export default function AdminEasterEgg({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clickCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchHandledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleInteraction = () => {
    clickCountRef.current += 1;

    // Reset le compteur après 800ms
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      touchHandledRef.current = false;
    }, 800);

    // Si triple-clic/tap, naviguer vers /admin
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      touchHandledRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      router.push("/admin");
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Empêcher le onClick de se déclencher après le touch
    e.preventDefault();
    touchHandledRef.current = true;
    handleInteraction();
  };

  const handleClick = () => {
    // Ignorer le clic s'il vient d'un événement touch
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    handleInteraction();
  };

  return (
    <span
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
