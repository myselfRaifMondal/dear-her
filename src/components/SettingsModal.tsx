import type { UserSettings } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type SettingsModalProps = {
  open: boolean;
  settings: UserSettings;
  onClose: () => void;
  onChangeSettings: (settings: UserSettings) => void;
  onClearData: () => void;
};

export function SettingsModal({ open, settings, onClose, onChangeSettings, onClearData }: SettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-5 py-8 backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <GlassCard className="max-h-[90vh] w-full max-w-2xl overflow-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-200/75">Settings</p>
            <h2 id="settings-title" className="mt-2 font-display text-4xl font-semibold text-cream-100">
              Make the sanctuary gentler.
            </h2>
          </div>
          <SoftButton variant="ghost" onClick={onClose} aria-label="Close settings">
            Close
          </SoftButton>
        </div>

        <div className="mt-8 space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-cream-100">
            <span>
              <span className="block font-semibold">Reduced motion</span>
              <span className="mt-1 block text-sm text-cream-100/60">Use fewer floating and breathing animations.</span>
            </span>
            <input
              className="h-5 w-5 accent-rose-200"
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(event) => onChangeSettings({ ...settings, reducedMotion: event.currentTarget.checked })}
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-cream-100">
            <span>
              <span className="block font-semibold">Reduced transparency</span>
              <span className="mt-1 block text-sm text-cream-100/60">Make glass panels darker and easier to read.</span>
            </span>
            <input
              className="h-5 w-5 accent-rose-200"
              type="checkbox"
              checked={settings.reducedTransparency}
              onChange={(event) => onChangeSettings({ ...settings, reducedTransparency: event.currentTarget.checked })}
            />
          </label>

          <label className="block rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-cream-100">
            <span className="block font-semibold">Default ambience volume</span>
            <span className="mt-1 block text-sm text-cream-100/60">Keep it soft enough to sit behind the experience.</span>
            <input
              className="mt-4 w-full accent-rose-200"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.ambienceVolume}
              onChange={(event) => onChangeSettings({ ...settings, ambienceVolume: Number(event.currentTarget.value) })}
              aria-label="Default ambience volume"
            />
          </label>
        </div>

        <div className="mt-8 rounded-3xl border border-rose-200/20 bg-rose-200/[0.08] p-4">
          <p className="font-semibold text-cream-100">Local MVP privacy</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Memories and favorites are stored only in this browser using localStorage. Clearing data removes them from this device.
          </p>
          <SoftButton variant="secondary" className="mt-4" onClick={onClearData}>
            Clear local data
          </SoftButton>
        </div>
      </GlassCard>
    </div>
  );
}
