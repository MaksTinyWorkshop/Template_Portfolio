"use client";

import { ToggleButton, useTheme } from "@once-ui-system/core";
import React, { useEffect, useState } from "react";
import styles from "./Header.module.scss";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(
      document.documentElement.getAttribute("data-theme") || "light",
    );
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setCurrentTheme(
      document.documentElement.getAttribute("data-theme") || "light",
    );
  }, [theme]);

  const icon = currentTheme === "dark" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  return (
    <ToggleButton
      prefixIcon={icon}
      className={styles.navbarButton}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      size={isMobile ? "l" : "m"}
    />
  );
};
