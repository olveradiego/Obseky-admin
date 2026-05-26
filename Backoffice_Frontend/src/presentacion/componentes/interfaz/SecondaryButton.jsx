import clsx from "clsx";

export const SecondaryButton = ({ className, children, ...props }) => (
  <button className={clsx("app-button app-button-secondary px-4 py-2.5 text-sm", className)} {...props}>
    {children}
  </button>
);
