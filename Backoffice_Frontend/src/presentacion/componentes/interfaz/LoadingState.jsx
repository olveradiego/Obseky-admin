import clsx from "clsx";

const SkeletonBlock = ({ className }) => <div className={clsx("app-skeleton rounded-2xl", className)} />;

export const LoadingState = ({ label = "Cargando...", variant = "panel", className }) => {
  if (variant === "table") {
    return (
      <div className={clsx("app-card overflow-hidden", className)}>
        <div className="border-b border-[var(--ghost-border)] px-5 py-4">
          <SkeletonBlock className="h-5 w-40" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 gap-3">
              <SkeletonBlock className="col-span-2 h-10" />
              <SkeletonBlock className="col-span-3 h-10" />
              <SkeletonBlock className="col-span-5 h-10" />
              <SkeletonBlock className="col-span-2 h-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={clsx("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("app-card p-5", className)}>
      <p className="app-section-label">{label}</p>
      <div className="mt-4 space-y-3">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
    </div>
  );
};
