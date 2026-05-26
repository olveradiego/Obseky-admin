import clsx from "clsx";
import { Search } from "lucide-react";

export const SearchField = ({ className, icon = Search, ...props }) => {
  const Icon = icon;
  return (
    <label className={clsx("app-input-shell", className)}>
      <Icon className="h-4 w-4 shrink-0 text-[var(--on-surface-variant)]" />
      <input className="app-input border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0" {...props} />
    </label>
  );
};
