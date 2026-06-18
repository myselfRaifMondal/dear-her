import { useRef, useState } from "react";
import type { Memory } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type PersonalMemoriesProps = {
  memories: Memory[];
  onAddMemory: (memory: Memory) => void;
  onDeleteMemory: (id: string) => void;
};

export function PersonalMemories({ memories, onAddMemory, onDeleteMemory }: PersonalMemoriesProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined): void {
    setError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a photo or image file.");
      return;
    }

    if (file.size > 1_400_000) {
      setError("Choose an image below 1.4 MB for this local MVP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.onerror = () => setError("The image could not be read. Try another one.");
    reader.readAsDataURL(file);
  }

  function submitMemory(): void {
    if (!title.trim() || !caption.trim() || !imageDataUrl) {
      setError("Add a photo, title, and short caption first.");
      return;
    }

    onAddMemory({
      id: crypto.randomUUID(),
      title: title.trim(),
      caption: caption.trim(),
      imageDataUrl,
      createdAt: new Date().toISOString(),
    });

    setTitle("");
    setCaption("");
    setImageDataUrl(null);
    setError(null);

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Personal memories</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Keep a soft moment here.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Add a photo and a small note that reminds you life can still feel gentle. This is your private care corner on this device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <GlassCard className="h-fit">
          <h3 className="font-display text-3xl font-semibold text-cream-100">Add memory</h3>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Choose something that feels safe, warm, funny, loving, or quietly beautiful.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-cream-100/70">
              Photo
              <input
                ref={fileRef}
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm text-cream-100 file:mr-4 file:rounded-full file:border-0 file:bg-cream-100 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                type="file"
                accept="image/*"
                onChange={(event) => handleFile(event.currentTarget.files?.[0])}
              />
            </label>

            {imageDataUrl ? (
              <img className="h-56 w-full rounded-3xl object-cover" src={imageDataUrl} alt="Selected memory preview" />
            ) : (
              <div className="grid h-44 place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.035] px-6 text-center text-sm leading-6 text-cream-100/55">
                A soft photo preview will appear here.
              </div>
            )}

            <label className="block text-sm font-semibold text-cream-100/70">
              Title
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                placeholder="A good day, a safe place..."
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/70">
              Caption
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={caption}
                onChange={(event) => setCaption(event.currentTarget.value)}
                placeholder="Why does this moment feel soft?"
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p> : null}

            <SoftButton className="w-full" onClick={submitMemory}>
              Save memory
            </SoftButton>
          </div>
        </GlassCard>

        <div className="grid gap-5 sm:grid-cols-2">
          {memories.length === 0 ? (
            <GlassCard className="sm:col-span-2">
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-200/[0.12] via-white/[0.045] to-lavender-200/[0.10] p-6 sm:p-8">
                <p className="font-display text-4xl font-semibold text-cream-100">Your memory room is waiting softly.</p>
                <p className="mt-4 max-w-2xl leading-7 text-cream-100/65">
                  You do not need a perfect photo. Start with one tiny proof that comfort exists: a sky, a meal, a person, a pet, a
                  place, a mirror selfie, a moment when the day felt less heavy.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["A safe place", "A loved person", "A softer day"].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-semibold text-cream-100/75">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ) : (
            memories.map((memory) => (
              <GlassCard key={memory.id} className="overflow-hidden p-3">
                <img className="h-56 w-full rounded-[1.5rem] object-cover" src={memory.imageDataUrl} alt={memory.title} />
                <div className="p-3">
                  <p className="font-display text-3xl font-semibold text-cream-100">{memory.title}</p>
                  <p className="mt-2 leading-6 text-cream-100/60">{memory.caption}</p>
                  <button
                    className="mt-4 rounded-full px-3 py-2 text-sm font-semibold text-cream-100/60 hover:bg-white/10 hover:text-cream-100"
                    onClick={() => onDeleteMemory(memory.id)}
                  >
                    Remove
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
