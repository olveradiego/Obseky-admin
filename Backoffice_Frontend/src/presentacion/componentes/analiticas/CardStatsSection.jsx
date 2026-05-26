import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { CreditCard } from "lucide-react";
import { getStatusColor } from "@/aplicacion/utilidades/cardStatsUtils";
import { DataCard } from "@/presentacion/componentes/interfaz/DataCard";
import { KPIGrid } from "@/presentacion/componentes/interfaz/KPIGrid";
import { EmptyState } from "@/presentacion/componentes/interfaz/EmptyState";
import { SurfacePanel } from "@/presentacion/componentes/interfaz/SurfacePanel";

export const CardStatsSection = ({ cardStats, totalCards, normalizedCardsByStatus, loading, error }) => {
  const activoCount = useMemo(() => {
    const activeStatus = (normalizedCardsByStatus || []).find((statusItem) => statusItem.status === "Activo");
    return activeStatus ? activeStatus.count : 0;
  }, [normalizedCardsByStatus]);

  const pieChartData = useMemo(() => normalizedCardsByStatus || [], [normalizedCardsByStatus]);
  const otherFundamentalStates = useMemo(
    () => (normalizedCardsByStatus || []).filter((item) => item.status !== "Activo"),
    [normalizedCardsByStatus]
  );

  return (
    <section className="space-y-4">
      <div>
        <p className="app-section-label">Tarjetas</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">Distribucion y estados operativos</h2>
      </div>

      {cardStats && (totalCards > 0 || (normalizedCardsByStatus && normalizedCardsByStatus.length > 0)) ? (
        <>
          <KPIGrid>
            <DataCard label="Total de Tarjetas" value={totalCards} icon={CreditCard} tone="primary" />
            <DataCard label="Activo" value={activoCount} />
            {otherFundamentalStates.map((statusData) => (
              <DataCard key={statusData.status} label={statusData.status} value={statusData.count} />
            ))}
          </KPIGrid>

          {!loading && !error && pieChartData.length > 0 && totalCards > 0 ? (
            <SurfacePanel className="p-5 md:p-6">
              <div className="mb-4">
                <p className="app-section-label">Comparativa</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--on-surface)]">Estados de tarjeta</h3>
              </div>
              <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="mx-auto w-full max-w-xl">
                  <Pie
                    data={{
                      labels: pieChartData.map((item) => item.status),
                      datasets: [
                        {
                          label: "Numero de tarjetas",
                          data: pieChartData.map((item) => item.count),
                          backgroundColor: pieChartData.map((item) => getStatusColor(item.status)),
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.label}: ${new Intl.NumberFormat("es-MX").format(context.parsed)}`,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="space-y-3">
                  {pieChartData.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-2xl bg-[var(--surface-low)] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getStatusColor(item.status) }} />
                        <span className="text-sm font-medium text-[var(--on-surface)]">{item.status}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--on-surface-variant)]">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SurfacePanel>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="Sin estadisticas de tarjetas"
          description="No hay datos suficientes para mostrar distribucion de estados con los filtros seleccionados."
        />
      )}
    </section>
  );
};

