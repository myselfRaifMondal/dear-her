import type { ButtonHTMLAttributes, ReactNode } from "react";

type SoftButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variantClasses: Record<NonNullable<SoftButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-rose-200/95 via-[#e7b98d]/95 to-lavender-200/95 text-slate-950 shadow-[0_20px_60px_rgba(244,184,198,0.24)] hover:shadow-[0_24px_80px_rgba(244,184,198,0.34)]",
  secondary:
    "border border-white/20 bg-white/[0.08] text-cream-100 shadow-[0_16px_45px_rgba(0,0,0,0.22)] hover:bg-white/10",
  ghost: "text-cream-100/85 hover:bg-white/10 focus-visible:bg-white/10",
};

export function SoftButton({ children, className = "", variant = "primary", ...props }: SoftButtonProps) {
  return (
    <button
      className={`group inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.01em] transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-200 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:-translate-y-0.5 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="transition-transform duration-300 motion-safe:group-hover:scale-[1.02]">{children}</span>
    </button>
  );
}
