"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Fade, Flex, Line, Row, ToggleButton } from "@once-ui-system/core";

import { about, blog, display, gallery, routes, work } from "@/web/resources";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import styles from "./Header.module.scss";
import { ThemeToggle } from "./ThemeToggle";

const AUTH_HINT_KEY = "portfolio_admin_auth_hint";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return (
    <span aria-live="off" aria-atomic="true">
      {currentTime}
    </span>
  );
};

type HeaderProps = {
  sitePerson: PersonSiteData;
};

export const Header = ({ sitePerson }: HeaderProps) => {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isAdminRoute = pathname.startsWith("/admin");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/authenticate", {
      method: "DELETE",
    });
    try {
      sessionStorage.removeItem(AUTH_HINT_KEY);
    } catch {
      // ignore
    }
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Fade s={{ hide: true }} fillWidth position="fixed" height="80" zIndex={9} />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />
      <Row
        fitHeight
        className={styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{
          position: "fixed",
        }}
      >
        <Row paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
          {display.location && <Row s={{ hide: true }}>{sitePerson.location}</Row>}
        </Row>
        <Row fillWidth horizontal="center">
          <Row
            background="page"
            border="neutral-alpha-weak"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
            zIndex={1}
          >
            <Row vertical="center" textVariant="body-default-s" suppressHydrationWarning>
              {routes["/"] && (
                <ToggleButton
                  prefixIcon="home"
                  className={styles.navbarButton}
                  href="/"
                  selected={pathname === "/"}
                  size={isMobile ? "l" : "m"}
                  aria-label="Accueil"
                />
              )}
              <Line
                background="neutral-alpha-medium"
                vert
                maxHeight={isMobile ? "32" : "24"}
                style={{ margin: "0 var(--static-space-8)" }}
              />
              {routes["/about"] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="person"
                      className={styles.navbarButton}
                      href="/about"
                      label={about.label}
                      selected={pathname === "/about"}
                      size={isMobile ? "l" : "m"}
                      aria-label={about.label || "À propos"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="person"
                      className={styles.navbarButton}
                      href="/about"
                      selected={pathname === "/about"}
                      size={isMobile ? "l" : "m"}
                      aria-label={about.label || "À propos"}
                    />
                  </Row>
                </>
              )}
              {routes["/work"] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="grid"
                      className={styles.navbarButton}
                      href="/work"
                      label={work.label}
                      selected={pathname.startsWith("/work")}
                      size={isMobile ? "l" : "m"}
                      aria-label={work.label || "Projets"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="grid"
                      className={styles.navbarButton}
                      href="/work"
                      selected={pathname.startsWith("/work")}
                      size={isMobile ? "l" : "m"}
                      aria-label={work.label || "Projets"}
                    />
                  </Row>
                </>
              )}
              {routes["/blog"] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="book"
                      className={styles.navbarButton}
                      href="/blog"
                      label={blog.label}
                      selected={pathname.startsWith("/blog")}
                      size={isMobile ? "l" : "m"}
                      aria-label={blog.label || "Blog"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="book"
                      className={styles.navbarButton}
                      href="/blog"
                      selected={pathname.startsWith("/blog")}
                      size={isMobile ? "l" : "m"}
                      aria-label={blog.label || "Blog"}
                    />
                  </Row>
                </>
              )}
              {routes["/gallery"] && (
                <>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      className={styles.navbarButton}
                      href="/gallery"
                      label={gallery.label}
                      selected={pathname.startsWith("/gallery")}
                      size={isMobile ? "l" : "m"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="gallery"
                      href="/gallery"
                      selected={pathname.startsWith("/gallery")}
                      size={isMobile ? "l" : "m"}
                      aria-label={gallery.label || "Galerie"}
                    />
                  </Row>
                </>
              )}
              {isAdminRoute && (
                <>
                  <Line
                    background="neutral-alpha-medium"
                    vert
                    maxHeight={isMobile ? "32" : "24"}
                    style={{ margin: "0 var(--static-space-8)" }}
                  />
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="adminDashboard"
                      className={styles.navbarButton}
                      href="/admin"
                      label="Dashboard"
                      selected={pathname === "/admin"}
                      size={isMobile ? "l" : "m"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="adminDashboard"
                      className={styles.navbarButton}
                      href="/admin"
                      selected={pathname === "/admin"}
                      size={isMobile ? "l" : "m"}
                      aria-label="Dashboard Admin"
                    />
                  </Row>
                  <Row s={{ hide: true }}>
                    <ToggleButton
                      prefixIcon="signOut"
                      className={styles.navbarButton}
                      onClick={handleLogout}
                      label="Déconnexion"
                      size={isMobile ? "l" : "m"}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <ToggleButton
                      prefixIcon="signOut"
                      className={styles.navbarButton}
                      onClick={handleLogout}
                      size={isMobile ? "l" : "m"}
                      aria-label="Se déconnecter de l'admin"
                    />
                  </Row>
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line
                    background="neutral-alpha-medium"
                    vert
                    maxHeight="24"
                    style={{ margin: "0 var(--static-space-8)" }}
                  />
                  <ThemeToggle />
                </>
              )}
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex s={{ hide: true }}>
              {display.time && <TimeDisplay timeZone={sitePerson.location ?? "UTC"} />}
            </Flex>
          </Flex>
        </Flex>
      </Row>
    </>
  );
};
