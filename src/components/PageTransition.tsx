import { motion } from "motion/react";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  reducedMotion: boolean;
};

const transition = {
  duration: 0.46,
  ease: [0.16, 1, 0.3, 1],
} as const;

export function PageTransition({ children, reducedMotion }: PageTransitionProps) {
  if (reducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
