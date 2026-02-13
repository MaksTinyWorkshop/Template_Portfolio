"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes, protectedRoutes } from "@/web/resources";
import { Flex, Spinner } from "@once-ui-system/core";
import NotFound from "@/app/(web)/not-found";
import { LoginPage } from "../admin/LoginPage";
import { AdminLayout } from "../admin/AdminLayout";
import { useTokenRefresh } from "@/web/hooks/useTokenRefresh";

const AUTH_HINT_KEY = "portfolio_admin_auth_hint";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAuthHint, setHasAuthHint] = useState(false);
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  // Rafraîchir automatiquement le token si authentifié
  useTokenRefresh();

  const { isRouteEnabled, isProtected } = useMemo(() => {
    const currentPath = pathname ?? "";

    const checkRouteEnabled = () => {
      if (!currentPath) return true;

      if (currentPath in routes) {
        return routes[currentPath as keyof typeof routes];
      }

      // Les routes dynamiques incluent /blog, /work et /admin (toutes les sous-routes)
      const dynamicRoutes = ["/blog", "/work", "/admin"] as const;
      for (const route of dynamicRoutes) {
        if (currentPath.startsWith(route)) {
          // Pour /admin, toujours autoriser l'accès (la protection est gérée séparément)
          if (route === "/admin") return true;
          // Pour les autres, vérifier si la route parent est activée
          if (routes[route]) return true;
        }
      }

      return false;
    };

    // Vérifier si la route ou une route parente est protégée
    const checkProtected = () => {
      if (!currentPath) return false;
      return (
        protectedRoutes[currentPath as keyof typeof protectedRoutes] ||
        Object.keys(protectedRoutes).some(
          (route) =>
            currentPath.startsWith(`${route}/`) &&
            protectedRoutes[route as keyof typeof protectedRoutes],
        )
      );
    };

    return { isRouteEnabled: checkRouteEnabled(), isProtected: checkProtected() };
  }, [pathname]);

  useEffect(() => {
    if (!isProtected) {
      setHasAuthHint(false);
      return;
    }

    try {
      setHasAuthHint(sessionStorage.getItem(AUTH_HINT_KEY) === "1");
    } catch {
      setHasAuthHint(false);
    }
  }, [isProtected, pathname]);

  useEffect(() => {
    if (!isProtected) {
      setAuthChecked(false);
      setIsAuthenticated(false);
      return;
    }

    let cancelled = false;
    setAuthChecked(false);
    setIsAuthenticated(false);

    const run = async () => {
      try {
        const response = await fetch("/api/check-auth");
        if (!cancelled) {
          setIsAuthenticated(response.ok);
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isProtected, pathname]);

  const handleLoginSuccess = async () => {
    try {
      sessionStorage.setItem(AUTH_HINT_KEY, "1");
    } catch {
      // ignore
    }

    // Re-vérifier l'authentification après login pour s'assurer que le cookie est bien propagé
    const response = await fetch("/api/check-auth");
    if (response.ok) {
      setIsAuthenticated(true);
      setAuthChecked(true);
      // Forcer Next.js à rafraîchir le cache du router pour que les Links fonctionnent
      router.refresh();
    }
  };

  if (!pathname) {
    return <>{children}</>;
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  if (isProtected && !authChecked) {
    if (!hasAuthHint) {
      return <LoginPage onSuccess={handleLoginSuccess} />;
    }
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (isProtected && !isAuthenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  // Envelopper les routes admin avec le layout admin
  if (isAdminRoute && isAuthenticated) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <>{children}</>;
};

export { RouteGuard };
