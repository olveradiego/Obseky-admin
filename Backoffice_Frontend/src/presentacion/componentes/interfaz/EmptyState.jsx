import { createElement } from "react";
import clsx from "clsx";
import { Inbox } from "lucide-react";
import { SurfacePanel } from "./SurfacePanel";

export const EmptyState = ({
  title = "Sin resultados",
  description = "No hay informacion disponible para mostrar en este momento.",
  action,
  icon = Inbox,
  className,
}) => {
  return (
    <SurfacePanel className={clsx("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-container)] text-[var(--primary)]">
        {createElement(icon, { className: "h-6 w-6" })}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--on-surface)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </SurfacePanel>
  );
};
