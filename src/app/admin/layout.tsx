import type { ReactNode } from "react";

export const metadata = {
  title: "Admin - Portfolio",
  description: "Interface d'administration du portfolio",
};

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Layout admin simple
 * Le RouteGuard gère déjà l'authentification et le layout visuel
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <>{children}</>;
}
