﻿import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Users,
  UserSquare2,
  WalletCards,
} from "lucide-react";
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { canAccessModule } from "@/dominio/servicios/permissionService";
import { useSession } from "@/presentacion/ganchos/useSession";
import { AppShell } from "@/presentacion/componentes/interfaz/AppShell";

const BASE_NAV_ITEMS = [
  { path: "/", label: "Inicio", icon: LayoutDashboard },
  { path: "/analytics", label: "Analitica", icon: BarChart3 },
  { path: "/finanzas", label: "Finanzas", icon: CircleDollarSign },
  { path: "/modules/cardcodes", label: "Generar Tarjetas", icon: WalletCards, moduleKey: MODULE_KEYS.CARD_CODES },
  { path: "/modules/users", label: "Usuarios", icon: Users, moduleKey: MODULE_KEYS.USERS },
  { path: "/modules/companies", label: "Companias", icon: Building2, moduleKey: MODULE_KEYS.COMPANIES },
];

export const AppLayout = () => {
  const location = useLocation();
  const { logout, profile, metaConfig } = useSession();

  const role = profile?.admin?.role;
  const permissions = profile?.permissions;

  const navItems = BASE_NAV_ITEMS.filter((item) => {
    if (!item.moduleKey) return true;
    return canAccessModule({
      role,
      permissions,
      permissionsMatrix: metaConfig?.permissionsMatrix,
      moduleKey: item.moduleKey,
    });
  });

  const mobileNav = (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              isActive
                ? "bg-(--primary) text-(--on-primary)"
                : "border border-(--ghost-border) bg-white/80 text-(--on-surface-variant)"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <AppShell
      brand={{ mark: "LA", name: "LoginAdmin", subtitle: "Consola admin" }}
      navItems={navItems}
      currentPath={location.pathname}
      userName={profile?.admin?.name || profile?.admin?.userName || "Administrador"}
      role={String(role || "Admin").replace("_", " ").toLowerCase()}
      onLogout={logout}
      mobileNav={mobileNav}
    >
      <Outlet />
    </AppShell>
  );
};
