import { Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { PrimaryButton } from "./PrimaryButton";
import { StatusBadge } from "./StatusBadge";

export const ModuleHeader = ({
  title,
  description,
  count = 0,
  createLabel = "Crear",
  onCreate,
  canCreate = true,
  createDisabledReason = "",
  actions,
}) => (
  <PageHeader
    eyebrow="Sistema CRUD"
    title={title}
    description={description}
    actions={
      <>
        <StatusBadge status="info">{count} registros</StatusBadge>
        {actions}
        <PrimaryButton
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          title={!canCreate ? createDisabledReason : createLabel}
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </PrimaryButton>
      </>
    }
  />
);
