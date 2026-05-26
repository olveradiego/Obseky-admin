import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppShell = ({ brand, navItems, currentPath, userName, role, onLogout, mobileNav, children }) => {
  return (
    <div className="app-shell">
      <Sidebar brand={brand} items={navItems} currentPath={currentPath} />
      <div className="min-h-screen min-w-0 flex-1">
        <Topbar userName={userName} role={role} onLogout={onLogout} mobileNav={mobileNav} />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
};
