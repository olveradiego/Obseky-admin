import clsx from "clsx";

export const IconButton = ({ className, children, label, ...props }) => (
  <button
    aria-label={label}
    title={label}
    className={clsx("app-button app-button-ghost h-10 w-10 rounded-xl p-0", className)}
    {...props}
  >
    {children}
  </button>
);
