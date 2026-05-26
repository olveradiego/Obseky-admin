import clsx from "clsx";

export const ModuleToolbar = ({ title, description, actions, meta, className }) => {
  return (
    <div className={clsx("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div>
        <h2 className="text-xl font-semibold text-[var(--on-surface)]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{description}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
