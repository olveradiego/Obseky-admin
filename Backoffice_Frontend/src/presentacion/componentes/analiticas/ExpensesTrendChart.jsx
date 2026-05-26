import { Line } from "react-chartjs-2";
import { eachMonthOfInterval, eachDayOfInterval, format, startOfMonth, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { es } from "date-fns/locale";
import { EmptyState } from "@/presentacion/componentes/interfaz/EmptyState";
import { SurfacePanel } from "@/presentacion/componentes/interfaz/SurfacePanel";

const formatMonthLabel = (value) => {
  const date = parseISO(`${value}-01`);
  if (isNaN(date.getTime())) return value;
  
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDayLabel = (value) => {
  const date = parseISO(value);
  if (isNaN(date.getTime())) return value;
  
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

export const ExpensesTrendChart = ({ expensesByMonth, expensesByDay, startDate, endDate }) => {
  // Determinar si usar vista diaria o mensual
  // Preferimos diaria si el rango es corto o hay pocos puntos
  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;
  const diffInDays = (start && end) ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const useDaily = (diffInDays > 0 && diffInDays <= 60) || (expensesByDay && expensesByDay.length > 0 && expensesByDay.length <= 45);
  const dataToUse = useDaily ? expensesByDay : expensesByMonth;

  if (!dataToUse || dataToUse.length === 0) {
    return (
      <EmptyState
        title="Sin tendencia de gastos"
        description="No se encontraron gastos registrados para construir la grafica de tendencia."
      />
    );
  }

  const labels = useDaily 
    ? dataToUse.map(item => formatDayLabel(item.day))
    : dataToUse.map(item => formatMonthLabel(item.month));

  const values = dataToUse.map(item => item.amount);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="app-section-label">Gastos</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">
            Trendencia {useDaily ? "diaria" : "mensual"}
          </h2>
        </div>
        <div className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          Vista: {useDaily ? "Detallada" : "Agrupada"}
        </div>
      </div>
      <SurfacePanel className="p-5 md:p-6 overflow-hidden">
        <div className="h-[22rem]">
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Gastos",
                  data: values,
                  borderColor: "#10b981",
                  backgroundColor: "rgba(16,185,129,0.1)",
                  borderWidth: 3,
                  tension: 0.35,
                  fill: true,
                  pointBackgroundColor: "#fff",
                  pointBorderColor: "#10b981",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#1e293b",
                  padding: 12,
                  titleFont: { size: 13 },
                  bodyFont: { size: 13 },
                  displayColors: false,
                  callbacks: {
                    label: (context) => `Monto: $${context.parsed.y.toLocaleString()}`
                  }
                }
              },
              scales: {
                x: { 
                  grid: { display: false }, 
                  ticks: { 
                    color: "#64748b",
                    maxRotation: 45,
                    minRotation: 0,
                    font: { size: 11 }
                  } 
                },
                y: { 
                  grid: { color: "rgba(226, 232, 240, 0.4)", drawBorder: false }, 
                  ticks: { 
                    color: "#64748b",
                    font: { size: 11 },
                    callback: (value) => `$${value}`
                  } 
                },
              },
            }}
          />
        </div>
      </SurfacePanel>
    </section>
  );
};
