import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";

const ICON_BY_TYPE = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const CLASS_BY_TYPE = {
  success: "border-[rgba(77,68,227,0.18)] bg-[rgba(77,68,227,0.1)] text-[var(--on-primary-container)]",
  error: "border-[rgba(158,63,78,0.18)] bg-[rgba(255,139,154,0.18)] text-[var(--error)]",
  info: "border-[rgba(71,125,187,0.18)] bg-[rgba(129,181,246,0.16)] text-[var(--on-surface)]",
  warning: "border-[rgba(96,94,98,0.18)] bg-[rgba(96,94,98,0.12)] text-[var(--secondary)]",
};

export const Notification = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message, duration, onClose]);

  if (!message && !isVisible) return null;
  const Icon = ICON_BY_TYPE[type] || ICON_BY_TYPE.info;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[60] w-[min(28rem,calc(100vw-2rem))] rounded-2xl border px-4 py-3 shadow-[var(--shadow-panel)] transition-all duration-300 ${
        CLASS_BY_TYPE[type] || CLASS_BY_TYPE.info
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1 text-sm font-medium">{message}</div>
        <button type="button" onClick={() => setIsVisible(false)} className="rounded-full p-1 opacity-70 transition hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
