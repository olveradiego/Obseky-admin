import { createElement } from "react";
import clsx from "clsx";

export const SurfacePanel = ({ as = "section", className, elevated = false, children, ...props }) =>
  createElement(
    as,
    {
      className: clsx(elevated ? "app-surface app-surface-elevated" : "app-surface", className),
      ...props,
    },
    children
  );
