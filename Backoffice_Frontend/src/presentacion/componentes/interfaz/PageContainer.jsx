import clsx from "clsx";

export const PageContainer = ({ className, children }) => (
  <div className={clsx("mx-auto flex w-full max-w-7xl flex-col gap-6 page-enter", className)}>{children}</div>
);
