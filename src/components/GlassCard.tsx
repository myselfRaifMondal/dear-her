import type { HTMLAttributes, ReactNode } from "react";

export function GlassCard({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-white/[0.075] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
