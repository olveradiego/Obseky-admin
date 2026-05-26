import clsx from "clsx";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

export const DataTable = ({
  columns,
  rows,
  getRowId,
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
}) => {
  if (loading) {
    return <LoadingState variant="table" className={className} />;
  }

  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} className={className} />;
  }

  const normalizedRows = rows || [];
  const allSelected =
    selectable &&
    normalizedRows.length > 0 &&
    normalizedRows.every((row) => selectedIds.includes(String(getRowId(row))));

  return (
    <div className={clsx("app-table-shell", className)}>
      <div className="overflow-x-auto">
        <table className="app-table min-w-full">
          <thead>
            <tr>
              {selectable ? (
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={Boolean(allSelected)}
                    onChange={(event) => onToggleAll?.(event.target.checked)}
                    aria-label="Seleccionar todos"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column.key} className={column.headerClassName}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row) => {
              const rowId = String(getRowId(row));
              return (
                <tr key={rowId}>
                  {selectable ? (
                    <td className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rowId)}
                        onChange={(event) => onToggleRow?.(rowId, event.target.checked, row)}
                        aria-label={`Seleccionar fila ${rowId}`}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={`${rowId}-${column.key}`} className={clsx("align-top", column.cellClassName)}>
                      {column.render ? column.render(row) : row?.[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
