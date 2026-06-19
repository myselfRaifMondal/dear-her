import type { Screen } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type NotFoundProps = {
  onNavigate: (screen: Screen) => void;
};

export function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-5xl place-items-center px-5 pb-36 pt-20 sm:px-8">
      <GlassCard className="w-full border-rose-200/20 bg-rose-200/[0.07] p-7 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Lost softly</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          This room does not exist yet.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-cream-100/70">
          Let’s bring you back somewhere calmer. You can breathe, open the comfort room, or return home.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <SoftButton onClick={() => onNavigate("breathe")}>Help me breathe</SoftButton>
          <SoftButton variant="secondary" onClick={() => onNavigate("room")}>
            Open comfort room
          </SoftButton>
          <SoftButton variant="ghost" onClick={() => onNavigate("welcome")}>
            Go home
          </SoftButton>
        </div>
      </GlassCard>
    </section>
  );
}
