import clsx from "clsx";

export const PageHeader = ({ eyebrow, title, description, actions, className }) => {
  return (
    <header className={clsx("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}
        <h1 className="app-page-title mt-1">{title}</h1>
        {description ? <p className="app-page-description mt-2 max-w-3xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
};
