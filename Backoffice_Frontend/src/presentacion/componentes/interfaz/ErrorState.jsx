import clsx from "clsx";
import { AlertTriangle } from "lucide-react";
import { SurfacePanel } from "./SurfacePanel";

export const ErrorState = ({ title = "Ocurrio un error", message, action, className }) => {
  return (
    <SurfacePanel className={clsx("border-[rgba(158,63,78,0.25)] bg-[rgba(255,139,154,0.12)] p-5", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[rgba(158,63,78,0.12)] text-[var(--error)]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--error)]">{title}</h3>
          <p className="mt-2 text-sm text-[var(--on-surface)]">{message}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </SurfacePanel>
  );
};
