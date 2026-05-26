import clsx from "clsx";

const TONE_CLASS = {
  default: "bg-[var(--surface-lowest)]",
  primary: "bg-[var(--primary-container)]",
  success: "bg-[rgba(77,68,227,0.08)]",
  warning: "bg-[rgba(96,94,98,0.08)]",
  danger: "bg-[rgba(158,63,78,0.12)]",
};

export const DataCard = ({ label, value, hint, icon: Icon, tone = "default", className }) => {
  return (
    <article className={clsx("app-card p-5", TONE_CLASS[tone] || TONE_CLASS.default, className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="app-section-label">{label}</p>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--on-surface)] md:text-3xl">
            {value}
          </div>
          {hint ? <p className="mt-2 text-sm text-[var(--on-surface-variant)]">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface-container)] text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
};
