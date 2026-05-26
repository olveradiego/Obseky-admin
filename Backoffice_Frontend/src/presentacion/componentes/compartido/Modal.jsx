import { X } from "lucide-react";
import { SurfacePanel } from "@/presentacion/componentes/interfaz/SurfacePanel";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,52,94,0.28)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <SurfacePanel
        elevated
        className="w-full max-w-2xl p-6 md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--ghost-border)] pb-4">
          <div>
            <p className="app-section-label">Formulario</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--on-surface)]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="app-button app-button-ghost h-10 w-10 p-0" aria-label="Cerrar modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </SurfacePanel>
    </div>
  );
};

