import { useState } from "react";
import { getFormattedDate } from "@/aplicacion/utilidades/dateUtils";
import { normalizeCardStats } from "@/aplicacion/utilidades/cardStatsUtils";
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { mergeFinancialSummaryWithExpenses } from "@/aplicacion/utilidades/financialSummaryUtils";

const sanitizeCsvText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00e1\u00e0\u00e4\u00e2]/gi, "a")
    .replace(/[\u00e9\u00e8\u00eb\u00ea]/gi, "e")
    .replace(/[\u00ed\u00ec\u00ef\u00ee]/gi, "i")
    .replace(/[\u00f3\u00f2\u00f6\u00f4]/gi, "o")
    .replace(/[\u00fa\u00f9\u00fc\u00fb]/gi, "u")
    .replace(/[\u00f1\u00d1]/g, (match) => (match === "\u00d1" ? "NI" : "ni"));

const toCsvLine = (row) => row.map(sanitizeCsvText).join(",");

export const useCsvExport = ({ token, moduleRepository, showNotification }) => {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportCSV = async (dataType, { selectedCompany, startDate, endDate, totalCards }) => {
    setExportLoading(true);
    try {
      let csvContent = "";
      let filename = "";

      const companyFilter = selectedCompany === "global" ? "" : selectedCompany;
      const formattedStartDate = getFormattedDate(startDate);
      const formattedEndDate = getFormattedDate(endDate);
      const dateRangeSuffix = `${formattedStartDate || "all"}_${formattedEndDate || "all"}`;

      const [cardStatsResult, financialSummaryResult, expensesByCategoryResult, expensesResult, companiesResult] = await Promise.all([
        moduleRepository.getCardStats({
          token,
          companyName: companyFilter,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }),
        (await import("@/aplicacion/casos-de-uso/analiticas/getFinancialSummaryUseCase")).getFinancialSummaryUseCase({
          moduleRepository,
          token,
          companyName: companyFilter,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }),
        (await import("@/aplicacion/casos-de-uso/analiticas/getExpensesByCategoryUseCase")).getExpensesByCategoryUseCase({
          moduleRepository,
          token,
          companyName: companyFilter,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }),
        moduleRepository.list({ moduleName: MODULE_KEYS.EXPENSES, token }),
        moduleRepository.list({ moduleName: MODULE_KEYS.COMPANIES, token }),
      ]);

      const currentCardStats = cardStatsResult.ok ? cardStatsResult.data : null;
      const currentFinancialSummary = financialSummaryResult.ok
        ? mergeFinancialSummaryWithExpenses({
            financialSummary: financialSummaryResult.data,
            expenses: expensesResult.ok ? expensesResult.data?.items || [] : [],
            companies: companiesResult.ok ? companiesResult.data?.items || [] : [],
            selectedCompany: companyFilter || "global",
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          })
        : null;

      if (dataType === "financial" && currentFinancialSummary) {
        const headers = ["Metrica", "Valor"];
        const rows = [
          ["Ingresos Totales", currentFinancialSummary.totalRevenue || 0],
          ["Egresos Registrados", currentFinancialSummary.totalRecordedExpenses || currentFinancialSummary.totalExpenses || 0],
          ["Egresos Pagados", currentFinancialSummary.totalPaidExpenses || 0],
          ["Balance", currentFinancialSummary.balance || 0],
          ["Cuentas por Cobrar", currentFinancialSummary.accountsReceivable || 0],
          ["Cuentas por Pagar", currentFinancialSummary.accountsPayable || 0],
        ];
        csvContent = [headers.join(","), ...rows.map(toCsvLine)].join("\n");
        filename = `resumen_financiero_${companyFilter || "global"}_${dateRangeSuffix}.csv`;
      } else if (dataType === "cards" && currentCardStats) {
        const headers = ["Metrica", "Valor"];
        const rows = [
          ["Total de Tarjetas", currentCardStats.totalCards || 0],
          ...(currentCardStats.cardsByStatus || []).map((statusItem) => [statusItem.status, statusItem.count]),
        ];
        csvContent = [headers.join(","), ...rows.map(toCsvLine)].join("\n");
        filename = `estadisticas_tarjetas_${companyFilter || "global"}_${dateRangeSuffix}.csv`;
      } else if (dataType === "all" && currentFinancialSummary && currentCardStats) {
        const financialHeaders = ["Metrica Financiera", "Valor"];
        const financialRows = [
          ["Ingresos Totales", currentFinancialSummary.totalRevenue || 0],
          ["Egresos Registrados", currentFinancialSummary.totalRecordedExpenses || currentFinancialSummary.totalExpenses || 0],
          ["Egresos Pagados", currentFinancialSummary.totalPaidExpenses || 0],
          ["Balance", currentFinancialSummary.balance || 0],
          ["Cuentas por Cobrar", currentFinancialSummary.accountsReceivable || 0],
          ["Cuentas por Pagar", currentFinancialSummary.accountsPayable || 0],
        ];
        const expensesByCategoryHeaders = ["Categoria de Gasto", "Monto"];
        const expensesByCategoryRows =
          expensesByCategoryResult.ok && expensesByCategoryResult.data
            ? expensesByCategoryResult.data.map((item) => [item.category, item.amount ?? item.totalAmount ?? item.total ?? 0])
            : [];
        const cardHeaders = ["Metrica Tarjetas", "Valor"];
        const normalizedExportCardsByStatus = currentCardStats ? normalizeCardStats(currentCardStats.cardsByStatus) : [];
        const cardRows = [
          ["Total de Tarjetas", totalCards || 0],
          ...(normalizedExportCardsByStatus || []).map((statusItem) => [statusItem.status, statusItem.count]),
        ];

        csvContent = [
          financialHeaders.join(","),
          ...financialRows.map(toCsvLine),
          "",
          cardHeaders.join(","),
          ...cardRows.map(toCsvLine),
          "",
          expensesByCategoryHeaders.join(","),
          ...expensesByCategoryRows.map(toCsvLine),
        ].join("\n");
        filename = `analiticas_completas_${companyFilter || "global"}_${dateRangeSuffix}.csv`;
      } else {
        showNotification("No hay datos disponibles para exportar.", "info");
        return;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar CSV:", err);
      showNotification("Error al generar el archivo CSV.", "error");
    } finally {
      setExportLoading(false);
    }
  };

  return { exportLoading, handleExportCSV };
};
