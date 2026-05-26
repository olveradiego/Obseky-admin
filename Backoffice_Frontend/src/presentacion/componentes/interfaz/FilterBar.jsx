import clsx from "clsx";
import { SurfacePanel } from "./SurfacePanel";

export const FilterBar = ({ className, children }) => {
  return (
    <SurfacePanel className={clsx("p-4 md:p-5", className)}>
      <div className="grid gap-4 xl:grid-cols-12">{children}</div>
    </SurfacePanel>
  );
};
