import { Eye, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "./IconButton";

export const TableRowActions = ({
  row,
  onView,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true,
  viewLabel = "Ver detalle",
  editLabel = "Editar registro",
  deleteLabel = "Eliminar registro",
}) => (
  <div className="flex items-center justify-end gap-1">
    {onView ? (
      <IconButton type="button" label={viewLabel} onClick={() => onView(row)} disabled={!canView}>
        <Eye className="h-4 w-4" />
      </IconButton>
    ) : null}
    <IconButton type="button" label={editLabel} onClick={() => onEdit(row)} disabled={!canEdit}>
      <Pencil className="h-4 w-4" />
    </IconButton>
    <IconButton
      type="button"
      label={deleteLabel}
      onClick={() => onDelete(row)}
      disabled={!canDelete}
      className="text-[var(--error)]"
    >
      <Trash2 className="h-4 w-4" />
    </IconButton>
  </div>
);
