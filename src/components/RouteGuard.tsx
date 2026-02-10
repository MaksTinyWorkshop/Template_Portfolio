"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes, protectedRoutes } from "@/resources";
import { Flex, Spinner } from "@once-ui-system/core";
import NotFound from "@/app/not-found";
import { LoginPage } from "./admin/LoginPage";
import { AdminLayout } from "./admin/AdminLayout";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdminRoute = pathname?.startsWith("/admin");

  // Rafraîchir automatiquement le token si authentifié
  useTokenRefresh();

  useEffect(() => {
    const performChecks = async () => {
      setLoading(true);
      setIsRouteEnabled(false);
      setIsPasswordRequired(false);
      setIsAuthenticated(false);

      const checkRouteEnabled = () => {
        if (!pathname) return false;

        if (pathname in routes) {
          return routes[pathname as keyof typeof routes];
        }

        // Les routes dynamiques incluent /blog, /work et /admin (toutes les sous-routes)
        const dynamicRoutes = ["/blog", "/work", "/admin"] as const;
        for (const route of dynamicRoutes) {
          if (pathname?.startsWith(route)) {
            // Pour /admin, toujours autoriser l'accès (la protection est gérée séparément)
            if (route === "/admin") return true;
            // Pour les autres, vérifier si la route parent est activée
            if (routes[route]) return true;
          }
        }

        return false;
      };

      const routeEnabled = checkRouteEnabled();
      setIsRouteEnabled(routeEnabled);

      // Vérifier si la route ou une route parente est protégée
      const isProtected =
        protectedRoutes[pathname as keyof typeof protectedRoutes] ||
        Object.keys(protectedRoutes).some(
          (route) =>
            pathname?.startsWith(`${route}/`) &&
            protectedRoutes[route as keyof typeof protectedRoutes],
        );

      if (isProtected) {
        setIsPasswordRequired(true);

        const response = await fetch("/api/check-auth");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      }

      setLoading(false);
    };

    performChecks();
  }, [pathname]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  if (isPasswordRequired && !isAuthenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  // Envelopper les routes admin avec le layout admin
  if (isAdminRoute && isAuthenticated) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <>{children}</>;
};

export { RouteGuard };
