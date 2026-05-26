import { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from "chart.js";
import { BarChart3, CreditCard, ReceiptText } from "lucide-react";
import { useNotification } from "@/presentacion/ganchos/useNotification";
import { useSession } from "@/presentacion/ganchos/useSession";
import { useDateFilters } from "@/presentacion/ganchos/useDateFilters";
import { useCompanyFilter } from "@/presentacion/ganchos/useCompanyFilter";
import { AnalyticsFilters } from "@/presentacion/componentes/analiticas/AnalyticsFilters";
import { CardStatsSection } from "@/presentacion/componentes/analiticas/CardStatsSection";
import { ExpensesTrendChart } from "@/presentacion/componentes/analiticas/ExpensesTrendChart";
import { ExportButtons } from "@/presentacion/componentes/analiticas/ExportButtons";
import { PageLoadingState } from "@/presentacion/componentes/compartido/PageLoadingState";
import { PageErrorState } from "@/presentacion/componentes/compartido/PageErrorState";
import { useCsvExport } from "@/presentacion/ganchos/useCsvExport";
import { useAnalyticsData } from "@/presentacion/ganchos/useAnalyticsData";
import { Notification } from "@/presentacion/componentes/compartido/Notification";
import { DataCard } from "@/presentacion/componentes/interfaz/DataCard";
import { KPIGrid } from "@/presentacion/componentes/interfaz/KPIGrid";
import { formatCurrency } from "@/aplicacion/utilidades/currencyUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const ANALYTICS_TABS = [
  {
    id: "cards",
    label: "Tarjetas",
    icon: CreditCard,
    title: "Analitica de tarjetas",
    description: "Estados operativos, distribucion y volumen de tarjetas.",
  },
  {
    id: "expenses",
    label: "Panorama financiero",
    icon: ReceiptText,
    title: "Panorama financiero",
    description: "Lectura analitica del gasto y de los compromisos pendientes.",
  },
];

export const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("cards");
  const { token } = useSession();
  const { notification, showNotification, clearNotification } = useNotification();
  const { companies, selectedCompany, handleCompanyChange, resetCompanyFilter, moduleRepository } = useCompanyFilter();
  const { startDate, setStartDate, endDate, setEndDate, selectedPresetRange, handlePresetRangeChange, resetDateFilters } = useDateFilters();

  const {
    cardStats,
    financialSummary,
    expensesByMonth,
    expensesByDay,
    loading,
    error,
    normalizedCardsByStatus,
    totalCards,
  } = useAnalyticsData({ selectedCompany, startDate, endDate });

  const { exportLoading, handleExportCSV } = useCsvExport({
    token,
    moduleRepository,
    showNotification,
  });

  const handleResetFilters = () => {
    resetCompanyFilter();
    resetDateFilters();
  };

  const activeTabMeta = ANALYTICS_TABS.find((tab) => tab.id === activeTab) ?? ANALYTICS_TABS[0];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 font-sans">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight text-gray-800">Analitica</h2>
          <p className="mt-1 text-xs text-gray-500">Panel de control analitico</p>
        </div>
        <nav className="flex-1 space-y-1.5 px-4">
          {ANALYTICS_TABS.map((tab) => {
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
          {ANALYTICS_TABS.map((tab) => (
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

        <div className="p-4 md:p-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Analitica</p>
                  <h1 className="text-3xl font-bold text-gray-800">{activeTabMeta.title}</h1>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {activeTabMeta.description} Usa los filtros para acotar la lectura y exporta los datos cuando necesites compartir el analisis.
              </p>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-7">
              <AnalyticsFilters
                companies={companies}
                selectedCompany={selectedCompany}
                handleCompanyChange={handleCompanyChange}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedPresetRange={selectedPresetRange}
                handlePresetRangeChange={handlePresetRangeChange}
                handleResetFilters={handleResetFilters}
                loading={loading}
              />

              <div className="mt-5">
                <ExportButtons
                  onExport={(dataType) => handleExportCSV(dataType, { selectedCompany, startDate, endDate, totalCards })}
                  loading={loading}
                  exportLoading={exportLoading}
                  financialSummary={financialSummary}
                  cardStats={cardStats}
                  totalCards={totalCards}
                  normalizedCardsByStatus={normalizedCardsByStatus}
                />
              </div>

              <div className="mt-6 space-y-6">
                {loading && <PageLoadingState loadingLabel="Cargando estadisticas..." />}
                {error && <PageErrorState error={error} />}

                {!loading && !error && activeTab === "cards" ? (
                  <CardStatsSection
                    cardStats={cardStats}
                    totalCards={totalCards}
                    normalizedCardsByStatus={normalizedCardsByStatus}
                    loading={loading}
                    error={error}
                  />
                ) : null}

                {!loading && !error && activeTab === "expenses" ? (
                  <>
                    <ExpenseAnalyticsSummary financialSummary={financialSummary} />
                    <ExpensesTrendChart 
                      expensesByMonth={expensesByMonth} 
                      expensesByDay={expensesByDay}
                      startDate={startDate}
                      endDate={endDate}
                    />
                    <RecentExpensesList 
                      expensesByDay={expensesByDay} 
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>

      {notification ? (
        <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
      ) : null}
    </div>
  );
};

const ExpenseAnalyticsSummary = ({ financialSummary }) => {
  if (!financialSummary) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="app-section-label">Panorama financiero</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">Indicadores enfocados en gasto</h2>
      </div>
      <KPIGrid className="xl:grid-cols-3">
        <DataCard
          label="Egresos Registrados"
          value={formatCurrency(financialSummary.totalRecordedExpenses ?? financialSummary.totalExpenses)}
          icon={ReceiptText}
          tone="danger"
          hint="Monto acumulado de gastos operativos registrados en el periodo."
        />
        <DataCard
          label="Cuentas por Pagar"
          value={formatCurrency(financialSummary.accountsPayable)}
          tone="warning"
          hint="Compromisos pendientes de pago registrados en el sistema."
        />
        <DataCard
          label="Egresos Pagados"
          value={formatCurrency(financialSummary.totalPaidExpenses ?? 0)}
          hint="Suma de gastos operativos marcados como pagados."
        />
      </KPIGrid>
    </section>
  );
};

const RecentExpensesList = ({ expensesByDay }) => {
  if (!expensesByDay || expensesByDay.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="app-section-label">Detalle Reciente</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">Ultimos movimientos registrados (por dia)</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Monto Acumulado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expensesByDay.slice(-5).reverse().map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-700 font-medium">{item.day}</td>
                <td className="px-6 py-4 font-bold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
