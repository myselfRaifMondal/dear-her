import { useRef, useState } from "react";
import {
  clearStoredFavorites,
  clearStoredMemories,
  clearStoredMood,
  downloadLocalData,
  importLocalDataFromFile,
} from "../lib/storage";
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

function reloadAfterLocalChange(): void {
  window.setTimeout(() => window.location.reload(), 350);
}

export function SettingsModal({ open, settings, onClose, onChangeSettings, onClearData }: SettingsModalProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!open) return null;

  async function handleImport(file: File | undefined): Promise<void> {
    if (!file) return;

    try {
      await importLocalDataFromFile(file);
      setNotice("Care package imported. Refreshing your sanctuary...");
      reloadAfterLocalChange();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not import this file.");
    }
  }

  function confirmAndRun(message: string, action: () => void): void {
    const confirmed = window.confirm(message);
    if (!confirmed) return;
    action();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-5 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
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

        {notice ? (
          <div className="mt-6 rounded-3xl border border-rose-200/20 bg-rose-200/[0.08] p-4 text-sm leading-6 text-cream-100/75">
            {notice}
          </div>
        ) : null}

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

        <div className="mt-8 rounded-3xl border border-rose-200/20 bg-rose-200/[0.08] p-5">
          <p className="font-semibold text-cream-100">Private care package</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/65">
            Your memories, favorites, mood, and settings are stored only in this browser for the MVP. Export them before clearing your
            browser data.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SoftButton variant="secondary" onClick={downloadLocalData}>
              Export my data
            </SoftButton>

            <SoftButton variant="secondary" onClick={() => importInputRef.current?.click()}>
              Import data
            </SoftButton>
          </div>

          <input
            ref={importInputRef}
            className="hidden"
            type="file"
            accept="application/json"
            onChange={(event) => void handleImport(event.currentTarget.files?.[0])}
          />
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <p className="font-semibold text-cream-100">Clear local data</p>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Use these when you want the sanctuary to feel private again on this device.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SoftButton
              variant="secondary"
              onClick={() =>
                confirmAndRun("Clear saved memories from this browser?", () => {
                  clearStoredMemories();
                  setNotice("Memories cleared. Refreshing...");
                  reloadAfterLocalChange();
                })
              }
            >
              Clear memories
            </SoftButton>

            <SoftButton
              variant="secondary"
              onClick={() =>
                confirmAndRun("Clear saved favorite things from this browser?", () => {
                  clearStoredFavorites();
                  setNotice("Favorites cleared. Refreshing...");
                  reloadAfterLocalChange();
                })
              }
            >
              Clear favorites
            </SoftButton>

            <SoftButton
              variant="secondary"
              onClick={() =>
                confirmAndRun("Clear your saved mood from this browser?", () => {
                  clearStoredMood();
                  setNotice("Mood cleared. Refreshing...");
                  reloadAfterLocalChange();
                })
              }
            >
              Clear mood
            </SoftButton>

            <SoftButton
              variant="secondary"
              onClick={() =>
                confirmAndRun("Clear everything saved by Dear Her on this browser?", () => {
                  onClearData();
                  setNotice("All local Dear Her data cleared.");
                })
              }
            >
              Clear everything
            </SoftButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
