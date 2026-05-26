import clsx from "clsx";

const STATUS_CLASS = {
  success: "app-badge app-badge-success",
  ok: "app-badge app-badge-success",
  error: "app-badge app-badge-danger",
  danger: "app-badge app-badge-danger",
  warning: "app-badge app-badge-warning",
  pending: "app-badge app-badge-warning",
  info: "app-badge app-badge-info",
  idle: "app-badge",
  empty: "app-badge",
};

export const StatusBadge = ({ children, status = "idle", className }) => (
  <span className={clsx(STATUS_CLASS[status] || STATUS_CLASS.idle, className)}>{children}</span>
);
