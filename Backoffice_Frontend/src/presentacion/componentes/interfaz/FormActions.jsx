import clsx from "clsx";

export const FormActions = ({ className, children }) => {
  return <div className={clsx("flex flex-col-reverse gap-3 border-t border-[var(--ghost-border)] pt-4 sm:flex-row sm:justify-end", className)}>{children}</div>;
};
