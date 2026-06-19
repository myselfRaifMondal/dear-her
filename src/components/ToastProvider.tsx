import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

type ToastTone = "soft" | "success" | "warning";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = "soft"): void => {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-4 top-24 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`rounded-[1.5rem] border px-5 py-4 text-sm font-semibold leading-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${
                toast.tone === "success"
                  ? "border-emerald-200/20 bg-emerald-200/[0.10] text-cream-100"
                  : toast.tone === "warning"
                    ? "border-rose-200/25 bg-rose-200/[0.12] text-cream-100"
                    : "border-white/10 bg-slate-950/75 text-cream-100"
              }`}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
