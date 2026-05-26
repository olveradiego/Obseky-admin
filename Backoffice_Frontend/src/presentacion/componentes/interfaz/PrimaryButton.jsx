import clsx from "clsx";

export const PrimaryButton = ({ className, children, ...props }) => (
  <button className={clsx("app-button app-button-primary px-4 py-2.5 text-sm", className)} {...props}>
    {children}
  </button>
);
