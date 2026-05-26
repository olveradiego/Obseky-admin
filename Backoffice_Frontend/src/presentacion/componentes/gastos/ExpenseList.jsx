import { DataTable } from "@/presentacion/componentes/interfaz/DataTable";
import { StatusBadge } from "@/presentacion/componentes/interfaz/StatusBadge";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

export const ExpenseList = ({ items = [], onEdit, onDelete, selectedIds = [], onSelect, onSelectAll }) => {
  const columns = [
    {
      key: "description",
      header: "Descripcion",
      render: (item) => <span className="font-medium">{item.description}</span>,
    },
    {
      key: "amount",
      header: "Monto",
      render: (item) => <span className="mono">{formatCurrency(item.amount)}</span>,
    },
    {
      key: "date",
      header: "Fecha",
      render: (item) => formatDate(item.date),
    },
    {
      key: "companyName",
      header: "Compania",
      render: (item) => item.company?.name || item.companyName || item.companyId,
    },
    {
      key: "category",
      header: "Categoria",
      render: (item) => <StatusBadge status="info">{item.category || "-"}</StatusBadge>,
    },
    {
      key: "actions",
      header: "Acciones",
      cellClassName: "w-[1%] whitespace-nowrap",
      render: (item) => (
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={() => onEdit(item)} className="app-button app-button-secondary px-3 py-1.5 text-xs">
            Editar
          </button>
          <button onClick={() => onDelete(item.__rowId)} className="app-button app-button-danger px-3 py-1.5 text-xs">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowId={(item) => item.__rowId}
      selectable
      selectedIds={selectedIds}
      onToggleRow={onSelect}
      onToggleAll={onSelectAll}
      emptyTitle="Sin gastos"
      emptyDescription="No se encontraron gastos con los filtros aplicados."
    />
  );
};

