import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Globe,
  Download,
  ArrowRight,
} from "lucide-react";

import { ExpensesPage } from "@/presentacion/paginas/modulos/ExpensesPage";
import { OrdersPage } from "@/presentacion/paginas/modulos/OrdersPage";
import { ModuleEntityFormPage } from "@/presentacion/paginas/modulos/ModuleEntityFormPage";
import { MODULE_KEYS } from "@/dominio/constantes/modules";

export const FinancesPage = () => {
  const location = useLocation();
  const forcedTab = location.pathname.startsWith("/finanzas/orders")
    ? "orders"
    : location.pathname.startsWith("/finanzas/expenses")
      ? "expenses"
      : null;
  const [activeTabState, setActiveTab] = useState(() => {
    const nextTab = location.state?.financeTab;
    return typeof nextTab === "string" ? nextTab : "overview";
  });
  const activeTab = forcedTab || activeTabState;
  const isExpensesCreateRoute = location.pathname === "/finanzas/expenses/create";
  const isExpensesEditRoute = /^\/finanzas\/expenses\/[^/]+\/edit$/.test(location.pathname);
  const isOrdersCreateRoute = location.pathname === "/finanzas/orders/create";
  const isOrdersEditRoute = /^\/finanzas\/orders\/[^/]+\/edit$/.test(location.pathname);

  useEffect(() => {
    const onNavigate = (event) => {
      const nextTab = event?.detail;
      if (typeof nextTab === "string") setActiveTab(nextTab);
    };

    window.addEventListener("finanzas:navigate", onNavigate);
    return () => window.removeEventListener("finanzas:navigate", onNavigate);
  }, []);

  const tabs = [
    { id: "overview", label: "Operacion financiera", icon: Globe },
    { id: "expenses", label: "Gastos Operativos", icon: Receipt },
    { id: "orders", label: "Ordenes de Ventas", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 font-sans">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight text-gray-800">Finanzas</h2>
          <p className="mt-1 text-xs text-gray-500">Panel de control financiero</p>
        </div>
        <nav className="flex-1 space-y-1.5 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="relative flex-1 overflow-y-auto">
        <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white p-4 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "bg-gray-50 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`h-full ${activeTab === "expenses" || activeTab === "orders" ? "" : "p-4 md:p-8"}`}>
          {activeTab === "overview" && <FinanceOverview />}
          {activeTab === "expenses" &&
            (isExpensesCreateRoute ? (
              <ModuleEntityFormPage moduleKey={MODULE_KEYS.EXPENSES} mode="create" />
            ) : isExpensesEditRoute ? (
              <ModuleEntityFormPage moduleKey={MODULE_KEYS.EXPENSES} mode="edit" />
            ) : (
              <ExpensesPage />
            ))}
          {activeTab === "orders" &&
            (isOrdersCreateRoute ? (
              <ModuleEntityFormPage moduleKey={MODULE_KEYS.ORDERS} mode="create" />
            ) : isOrdersEditRoute ? (
              <ModuleEntityFormPage moduleKey={MODULE_KEYS.ORDERS} mode="edit" />
            ) : (
              <OrdersPage />
            ))}
        </div>
      </main>
    </div>
  );
};

const FinanceOverview = () => {
  const cards = [
    {
      title: "Resumen financiero",
      description: "Balance, ingresos, egresos y cuentas por cobrar/pagar en una sola vista.",
      to: "/analytics",
    },
    {
      title: "Gastos operativos",
      description: "Consulta, crea y administra egresos operativos por compania.",
      to: "#expenses",
    },
    {
      title: "Ordenes de venta",
      description: "Supervisa operaciones comerciales y su estado de pago.",
      to: "#orders",
    },
  ];

  const analyticsLinks = [
    {
      title: "Metricas globales",
      description: "KPIs globales y lectura general del sistema.",
      to: "/analytics",
    },
    {
      title: "Panorama financiero",
      description: "Analisis de egresos, cuentas por pagar y distribucion por categoria.",
      to: "/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-800">Finanzas</h2>
        <p className="mt-2 text-sm text-gray-500">
          Espacio dedicado a dinero, operacion financiera y seguimiento CRUD de gastos y ordenes. La analitica concentra el panorama financiero y los graficos comparativos para no duplicar contenido.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => {
              if (card.to === "#financial-summary") window.dispatchEvent(new CustomEvent("finanzas:navigate", { detail: "financial-summary" }));
              if (card.to === "#expenses") window.dispatchEvent(new CustomEvent("finanzas:navigate", { detail: "expenses" }));
              if (card.to === "#orders") window.dispatchEvent(new CustomEvent("finanzas:navigate", { detail: "orders" }));
            }}
            className="rounded-3xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-lg font-semibold text-gray-800">{card.title}</p>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-indigo-600">
              Abrir seccion
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Analitica centralizada</h3>
            <p className="mt-2 text-sm text-gray-500">
              Las vistas de metricas globales y del panorama financiero se mantienen en Analitica para tener una sola fuente de verdad y evitar paneles repetidos.
            </p>
          </div>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Ir a Analitica
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {analyticsLinks.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60"
            >
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};


