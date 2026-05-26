import { CircleDollarSign, Landmark, ReceiptText } from "lucide-react";
import { formatCurrency } from "@/aplicacion/utilidades/currencyUtils";
import { DataCard } from "@/presentacion/componentes/interfaz/DataCard";
import { KPIGrid } from "@/presentacion/componentes/interfaz/KPIGrid";

export const FinancialSummaryCards = ({ financialSummary }) => {
  if (!financialSummary) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="app-section-label">Resumen financiero</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">KPIs principales del periodo</h2>
      </div>
      <KPIGrid className="xl:grid-cols-3 2xl:grid-cols-6">
        <DataCard label="Ingresos Totales" value={formatCurrency(financialSummary.totalRevenue)} icon={Landmark} tone="success" />
        <DataCard
          label="Egresos Registrados"
          value={formatCurrency(financialSummary.totalRecordedExpenses ?? financialSummary.totalExpenses)}
          icon={ReceiptText}
          tone="danger"
        />
        <DataCard label="Egresos Pagados" value={formatCurrency(financialSummary.totalPaidExpenses ?? 0)} />
        <DataCard label="Balance" value={formatCurrency(financialSummary.balance)} icon={CircleDollarSign} tone="primary" />
        <DataCard label="Cuentas por Cobrar" value={formatCurrency(financialSummary.accountsReceivable)} />
        <DataCard label="Cuentas por Pagar" value={formatCurrency(financialSummary.accountsPayable)} tone="warning" />
      </KPIGrid>
    </section>
  );
};

