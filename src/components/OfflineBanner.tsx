import { motion } from "motion/react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <motion.div
      className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-full border border-rose-200/20 bg-slate-950/80 px-5 py-3 text-center text-sm font-semibold text-cream-100 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      aria-live="polite"
    >
      You are offline. Dear Her still works locally, but cloud sync will wait.
    </motion.div>
  );
}
