import clsx from "clsx";
import { LogOut, Search } from "lucide-react";
import { SearchField } from "./SearchField";

export const Topbar = ({ userName, role, onLogout, mobileNav, className }) => {
  return (
    <header className={clsx("app-topbar", className)}>
      <div className="flex flex-1 items-center gap-3">
        <div className="hidden min-w-[18rem] max-w-md lg:block">
          <SearchField icon={Search} placeholder="Buscar en el panel" readOnly aria-label="Busqueda visual" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <div className="text-sm font-semibold text-[var(--on-surface)]">{userName}</div>
          <div className="text-xs capitalize text-[var(--on-surface-variant)]">{role}</div>
        </div>
        <button type="button" onClick={onLogout} className="app-button app-button-ghost px-3 py-2 text-sm" title="Cerrar sesion">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
      {mobileNav ? <div className="col-span-full xl:hidden">{mobileNav}</div> : null}
    </header>
  );
};
