import clsx from "clsx";
import { SurfacePanel } from "./SurfacePanel";

export const AuthCard = ({ eyebrow, title, description, className, children }) => {
  return (
    <SurfacePanel elevated className={clsx("relative max-w-md overflow-hidden p-8 md:p-10", className)}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--primary-dim)] to-[var(--outline-variant)]" />
      {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}
      <h1 className="app-page-title mt-2 text-3xl">{title}</h1>
      {description ? <p className="app-page-description mt-3">{description}</p> : null}
      <div className="mt-8">{children}</div>
    </SurfacePanel>
  );
};
