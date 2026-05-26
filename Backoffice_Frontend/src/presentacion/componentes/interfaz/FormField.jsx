import clsx from "clsx";

export const FormField = ({ label, htmlFor, helper, error, className, children }) => {
  return (
    <label className={clsx("flex flex-col gap-2", className)} htmlFor={htmlFor}>
      {label ? <span className="app-field-label">{label}</span> : null}
      {children}
      {helper && !error ? <span className="text-xs text-[var(--on-surface-variant)]">{helper}</span> : null}
      {error ? <span className="text-xs font-medium text-[var(--error)]">{error}</span> : null}
    </label>
  );
};
