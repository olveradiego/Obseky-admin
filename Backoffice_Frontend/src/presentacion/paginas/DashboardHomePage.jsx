﻿import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/aplicacion/utilidades/currencyUtils";
import { buildEndpointCatalogFromMeta } from "@/aplicacion/adaptadores/metaConfigAdapter";
import { createModuleRepository } from "@/infraestructura/repositorios/moduleRepository";
import { useSession } from "@/presentacion/ganchos/useSession";
import { DataCard } from "@/presentacion/componentes/interfaz/DataCard";
import { PageHeader } from "@/presentacion/componentes/interfaz/PageHeader";
import { SurfacePanel } from "@/presentacion/componentes/interfaz/SurfacePanel";
import { LoadingState } from "@/presentacion/componentes/interfaz/LoadingState";
import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";
import { StatusBadge } from "@/presentacion/componentes/interfaz/StatusBadge";
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { mergeFinancialSummaryWithExpenses } from "@/aplicacion/utilidades/financialSummaryUtils";

const QUICK_LINKS = [
  { to: "/modules/users", label: "Usuarios", description: "Gestion administrativa y acceso", icon: Users },
  { to: "/modules/companies", label: "Companias", description: "Directorio corporativo y operacion", icon: Building2 },
  { to: "/modules/cardcodes", label: "Tarjetas", description: "Folios, codigos y validacion", icon: CreditCard },
  { to: "/finanzas", label: "Finanzas", description: "Gastos, ordenes y resumen global", icon: CircleDollarSign },
];

export const DashboardHomePage = () => {
  const { profile, apiBase, token, metaConfig } = useSession();
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  const moduleRepository = useMemo(
    () => createModuleRepository(apiBase, buildEndpointCatalogFromMeta(metaConfig)),
    [apiBase, metaConfig]
  );

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        const [financialSummaryResult, expensesResult, companiesResult] = await Promise.all([
          moduleRepository.getFinancialSummary({ token }),
          moduleRepository.list({ moduleName: MODULE_KEYS.EXPENSES, token }),
          moduleRepository.list({ moduleName: MODULE_KEYS.COMPANIES, token }),
        ]);

        if (financialSummaryResult.ok) {
          setFinancialSummary(
            mergeFinancialSummaryWithExpenses({
              financialSummary: financialSummaryResult.data,
              expenses: expensesResult.ok ? expensesResult.data?.items || [] : [],
              companies: companiesResult.ok ? companiesResult.data?.items || [] : [],
            })
          );
        } else {
          setErrorSummary(financialSummaryResult.error?.message || "Error al cargar el resumen financiero.");
        }
      } catch {
        setErrorSummary("Error de red al cargar el resumen financiero.");
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchFinancialSummary();
  }, [moduleRepository, token]);

  const getDisplayName = () =>
    profile?.admin?.name || profile?.admin?.userName || profile?.name || profile?.userName || profile?.email || "Usuario";

  const roleLabel = profile?.admin?.role ? profile.admin.role.replace("_", " ") : "Admin";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Inicio"
        title={`Bienvenido, ${getDisplayName()}`}
        description="Vista general del sistema, accesos rapidos y resumen operativo conectado a datos reales."
        actions={<StatusBadge status="info">{roleLabel}</StatusBadge>}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loadingSummary ? (
          <LoadingState variant="cards" className="sm:col-span-2 lg:col-span-3" />
        ) : errorSummary ? (
          <ErrorState className="sm:col-span-2 lg:col-span-3" message={errorSummary} />
        ) : (
          <>
            <DataCard label="Ingresos Totales" value={formatCurrency(financialSummary?.totalRevenue)} icon={BarChart3} tone="success" />
            <DataCard label="Egresos Registrados" value={formatCurrency(financialSummary?.totalRecordedExpenses ?? financialSummary?.totalExpenses)} icon={CircleDollarSign} tone="danger" />
            <DataCard label="Egresos Pagados" value={formatCurrency(financialSummary?.totalPaidExpenses)} tone="warning" />
            <DataCard label="Balance" value={formatCurrency(financialSummary?.balance)} icon={ShieldCheck} tone="primary" />
            <DataCard label="Cuentas por Cobrar" value={formatCurrency(financialSummary?.accountsReceivable)} tone="warning" />
            <DataCard label="Cuentas por Pagar" value={formatCurrency(financialSummary?.accountsPayable)} />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_minmax(0,1fr)]">
        <SurfacePanel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="app-section-label">Accesos</p>
              <h2 className="mt-1 text-xl font-semibold text-(--on-surface)">Modulos principales</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="app-card group p-5 transition hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-(--on-surface)">{item.label}</h3>
                      <p className="mt-2 text-sm text-(--on-surface-variant)">{item.description}</p>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-(--surface-container) text-(--primary)">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </SurfacePanel>

        <SurfacePanel className="p-6">
          <div className="mb-5">
            <p className="app-section-label">Permisos</p>
            <h2 className="mt-1 text-xl font-semibold text-(--on-surface)">Acceso efectivo del usuario</h2>
            <p className="mt-2 text-sm text-(--on-surface-variant)">
              Resumen de permisos visibles a partir del perfil autenticado y la matriz cargada por backend.
            </p>
          </div>

          <div className="space-y-3">
            {profile?.permissions ? (
              Object.entries(profile.permissions).map(([moduleKey, actions]) => (
                <div key={moduleKey} className="rounded-2xl bg-(--surface-low) p-4">
                  <div className="text-sm font-semibold capitalize text-(--on-surface)">{moduleKey}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(actions) && actions.length > 0 ? (
                      actions.map((action) => (
                        <StatusBadge key={`${moduleKey}-${action}`} status="info">
                          {action}
                        </StatusBadge>
                      ))
                    ) : (
                      <StatusBadge>Sin acciones</StatusBadge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <LoadingState label="Cargando permisos..." />
            )}
          </div>
        </SurfacePanel>
      </div>
    </div>
  );
};
