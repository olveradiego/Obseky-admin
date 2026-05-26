import clsx from "clsx";
import { Link } from "react-router-dom";

export const Sidebar = ({ brand, items = [], currentPath }) => {
  return (
    <aside className="app-sidebar hidden xl:flex xl:w-72 xl:flex-col">
      <div className="border-b border-[var(--ghost-border)] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)]">
            {brand?.mark || "LA"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--on-surface)]">{brand?.name || "LoginAdmin"}</p>
            {brand?.subtitle ? <p className="text-xs text-[var(--on-surface-variant)]">{brand.subtitle}</p> : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {items.map((item) => {
          const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx("app-nav-item", isActive && "app-nav-item-active")}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
