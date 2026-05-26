import clsx from "clsx";
import { SurfacePanel } from "./SurfacePanel";

export const FormSection = ({ title, description, actions, className, children }) => {
  return (
    <SurfacePanel className={clsx("p-5 md:p-6", className)}>
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 border-b border-[var(--ghost-border)] pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h3 className="text-lg font-semibold text-[var(--on-surface)]">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </SurfacePanel>
  );
};
