/**
 * @filePurpose ExportButtons.jsx
 * @description Componente para los botones de exportacion de la pagina de analiticas.
 */
export const ExportButtons = ({
  onExport,
  loading,
  exportLoading,
  financialSummary,
  cardStats,
  totalCards,
  normalizedCardsByStatus,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onExport("financial")}
        className="app-button app-button-secondary h-fit px-4 py-2.5 text-sm"
        disabled={loading || exportLoading || !financialSummary}
      >
        {exportLoading ? "Exportando..." : "Resumen financiero (CSV)"}
      </button>
      <button
        onClick={() => onExport("cards")}
        className="app-button app-button-secondary h-fit px-4 py-2.5 text-sm"
        disabled={loading || exportLoading || !cardStats || (totalCards === 0 && (normalizedCardsByStatus || []).length === 0)}
      >
        {exportLoading ? "Exportando..." : "Tarjetas (CSV)"}
      </button>
      <button
        onClick={() => onExport("all")}
        className="app-button app-button-primary h-fit px-4 py-2.5 text-sm"
        disabled={loading || exportLoading || (!financialSummary && !cardStats)}
      >
        {exportLoading ? "Exportando..." : "Analiticas completas (CSV)"}
      </button>
    </div>
  );
};
