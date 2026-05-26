import clsx from "clsx";

export const LoginShell = ({ className, children }) => {
  return (
    <main className={clsx("app-auth-shell", className)}>
      <div className="app-auth-glow app-auth-glow-left" />
      <div className="app-auth-glow app-auth-glow-right" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
};
