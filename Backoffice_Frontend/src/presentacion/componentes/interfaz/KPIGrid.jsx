import clsx from "clsx";

export const KPIGrid = ({ className, children }) => {
  return <div className={clsx("grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>{children}</div>;
};
