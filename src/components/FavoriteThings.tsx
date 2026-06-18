import { useState } from "react";
import type { FavoriteThing } from "../types/app";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type FavoriteThingsProps = {
  favorites: FavoriteThing[];
  onAddFavorite: (favorite: FavoriteThing) => void;
  onDeleteFavorite: (id: string) => void;
};

const kinds: FavoriteThing["kind"][] = ["song", "quote", "movie", "snack", "person", "ritual"];

const starterIdeas = [
  "A song that feels like a hug",
  "A quote she needs on low days",
  "A movie that feels safe",
  "A tiny ritual before sleep",
  "A person who feels calming",
  "A snack or drink that comforts",
];

export function FavoriteThings({ favorites, onAddFavorite, onDeleteFavorite }: FavoriteThingsProps) {
  const [kind, setKind] = useState<FavoriteThing["kind"]>("quote");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function addFavorite(): void {
    if (!title.trim()) return;

    onAddFavorite({
      id: crypto.randomUUID(),
      kind,
      title: title.trim(),
      note: note.trim() || "A small thing that feels comforting.",
      createdAt: new Date().toISOString(),
    });

    setTitle("");
    setNote("");
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-7xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Favorite things</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Your personal care package.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Save songs, quotes, snacks, people, movies, or tiny rituals that make difficult days feel less alone.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="h-fit">
          <h3 className="font-display text-3xl font-semibold text-cream-100">Add favorite</h3>
          <p className="mt-2 text-sm leading-6 text-cream-100/60">
            Add one small thing she can return to when the day feels heavy.
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {kinds.map((item) => (
                <button
                  key={item}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                    kind === item ? "border-cream-100 bg-cream-100 text-slate-950" : "border-white/10 bg-white/[0.05] text-cream-100/70"
                  }`}
                  onClick={() => setKind(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="block text-sm font-semibold text-cream-100/70">
              Title
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                placeholder="A song, quote, movie, person..."
              />
            </label>

            <label className="block text-sm font-semibold text-cream-100/70">
              Note
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                value={note}
                onChange={(event) => setNote(event.currentTarget.value)}
                placeholder="Why does this comfort you?"
              />
            </label>

            <SoftButton className="w-full" onClick={addFavorite} disabled={!title.trim()}>
              Save favorite
            </SoftButton>
          </div>
        </GlassCard>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.length === 0 ? (
            <GlassCard className="sm:col-span-2 xl:col-span-3">
              <p className="font-display text-4xl font-semibold text-cream-100">Start with one gentle thing.</p>
              <p className="mt-3 max-w-2xl leading-7 text-cream-100/65">
                This space becomes more powerful when it feels specific. Add anything that would make her think: “this was made for me.”
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {starterIdeas.map((idea) => (
                  <button
                    key={idea}
                    className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left text-sm font-semibold leading-6 text-cream-100/75 transition hover:bg-white/[0.08]"
                    onClick={() => {
                      setTitle(idea);
                      setNote("");
                    }}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </GlassCard>
          ) : (
            favorites.map((favorite) => (
              <GlassCard key={favorite.id}>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200/85">
                  {favorite.kind}
                </span>
                <p className="mt-5 font-display text-3xl font-semibold text-cream-100">{favorite.title}</p>
                <p className="mt-3 leading-6 text-cream-100/60">{favorite.note}</p>
                <button
                  className="mt-5 rounded-full px-3 py-2 text-sm font-semibold text-cream-100/60 hover:bg-white/10 hover:text-cream-100"
                  onClick={() => onDeleteFavorite(favorite.id)}
                >
                  Remove
                </button>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
