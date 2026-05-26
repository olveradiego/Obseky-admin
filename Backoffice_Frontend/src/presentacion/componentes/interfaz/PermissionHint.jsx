import { Lock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export const PermissionHint = ({ children = "Accion restringida por permisos." }) => {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
      <StatusBadge status="warning" className="inline-flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Restringido
      </StatusBadge>
      <span>{children}</span>
    </div>
  );
};
