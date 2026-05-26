export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="app-card mt-4 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--on-surface-variant)]">
        Pagina <span className="font-semibold text-[var(--on-surface)]">{currentPage}</span> de{" "}
        <span className="font-semibold text-[var(--on-surface)]">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="app-button app-button-secondary px-4 py-2 text-sm"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="app-button app-button-secondary px-4 py-2 text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
