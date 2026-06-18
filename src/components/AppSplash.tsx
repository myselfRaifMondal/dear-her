import { motion } from "motion/react";
import { useEffect, useState } from "react";

type AppSplashProps = {
  reducedMotion: boolean;
};

const splashKey = "dear-her-mvp:splash-seen";

export function AppSplash({ reducedMotion }: AppSplashProps) {
  const [visible, setVisible] = useState(() => window.sessionStorage.getItem(splashKey) !== "true");

  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(splashKey, "true");
      setVisible(false);
    }, reducedMotion ? 450 : 1250);

    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#070A1A] px-8 text-center text-cream-100"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.55 }}
      aria-label="Dear Her is opening"
    >
      <div>
        <motion.div
          className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border border-white/10 bg-white/[0.07] text-4xl shadow-[0_24px_90px_rgba(244,184,198,0.18)] backdrop-blur-2xl"
          animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
          transition={reducedMotion ? undefined : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        >
          ♡
        </motion.div>

        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Dear Her</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em]">Opening softly</h1>
        <p className="mt-3 text-sm text-cream-100/55">Take one gentle breath.</p>
      </div>
    </motion.div>
  );
}
