import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { deleteCloudPackage, getCurrentUser, loadCloudPackage, saveCloudPackage, signInWithEmail, signOutOfCloud } from "../lib/cloudSync";
import { createLocalDataExport, importLocalDataFromFile } from "../lib/dataPortability";
import { trackEvent } from "../lib/analytics";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { GlassCard } from "./GlassCard";
import { SoftButton } from "./SoftButton";

type Status = "idle" | "loading" | "success" | "error";

export function CloudSync() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [cloudUpdatedAt, setCloudUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    void getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function runCloudAction(action: () => Promise<void>): Promise<void> {
    setStatus("loading");
    setNotice(null);

    try {
      await action();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function handleSignIn(): Promise<void> {
    await runCloudAction(async () => {
      if (!email.trim()) {
        throw new Error("Enter your email first.");
      }

      await signInWithEmail(email.trim());
      setNotice("Magic link sent. Open your email on this device to sign in.");
      trackEvent("cloud_magic_link_sent");
    });
  }

  async function handleSignOut(): Promise<void> {
    await runCloudAction(async () => {
      await signOutOfCloud();
      setUser(null);
      setNotice("Signed out of cloud sync.");
      trackEvent("cloud_signed_out");
    });
  }

  async function handleSaveToCloud(): Promise<void> {
    await runCloudAction(async () => {
      const data = await createLocalDataExport();
      await saveCloudPackage(data);
      setCloudUpdatedAt(new Date().toISOString());
      setNotice("Your care package was saved to cloud.");
      trackEvent("cloud_backup_saved");
    });
  }

  async function handleCheckCloud(): Promise<void> {
    await runCloudAction(async () => {
      const cloud = await loadCloudPackage();

      if (!cloud) {
        setCloudUpdatedAt(null);
        setNotice("No cloud backup found yet.");
        return;
      }

      setCloudUpdatedAt(cloud.updatedAt);
      setNotice("Cloud backup found.");
      trackEvent("cloud_backup_checked");
    });
  }

  async function handleRestoreFromCloud(): Promise<void> {
    const confirmed = window.confirm("Restore cloud backup onto this browser? This may replace local memories and favorites.");

    if (!confirmed) return;

    await runCloudAction(async () => {
      const cloud = await loadCloudPackage();

      if (!cloud) {
        throw new Error("No cloud backup found.");
      }

      const file = new File([JSON.stringify(cloud.data)], "dear-her-cloud-restore.json", {
        type: "application/json",
      });

      await importLocalDataFromFile(file);
      setNotice("Cloud backup restored. Refreshing your sanctuary...");
      trackEvent("cloud_backup_restored");

      window.setTimeout(() => window.location.reload(), 700);
    });
  }

  async function handleDeleteCloud(): Promise<void> {
    const confirmed = window.confirm("Delete your Dear Her cloud backup? This will not clear local data on this browser.");

    if (!confirmed) return;

    await runCloudAction(async () => {
      await deleteCloudPackage();
      setCloudUpdatedAt(null);
      setNotice("Cloud backup deleted.");
      trackEvent("cloud_backup_deleted");
    });
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-6xl px-5 pb-36 pt-10 sm:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/75">Cloud sync</p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-[-0.03em] text-cream-100 sm:text-7xl">
          Keep her care package safe.
        </h2>
        <p className="mt-5 leading-7 text-cream-100/70">
          Save memories, favorites, settings, and mood locally first — then back them up privately with Supabase when configured.
        </p>
      </div>

      {!isSupabaseConfigured ? (
        <GlassCard className="border-rose-200/20 bg-rose-200/[0.07]">
          <p className="font-display text-3xl font-semibold text-cream-100">Supabase is not connected yet.</p>
          <p className="mt-3 leading-7 text-cream-100/65">
            The app still works locally. To enable cloud sync, create a Supabase project, run the SQL file, and add the environment
            variables below.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5 font-mono text-sm leading-7 text-cream-100/75">
            <p>1. Run: supabase/schema.sql in Supabase SQL Editor</p>
            <p>2. Create .env.local in this project</p>
            <p>3. Add VITE_SUPABASE_URL</p>
            <p>4. Add VITE_SUPABASE_ANON_KEY</p>
            <p>5. Restart npm run dev</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassCard className="h-fit">
            <p className="font-display text-3xl font-semibold text-cream-100">
              {user ? "Cloud is connected." : "Sign in with email."}
            </p>

            {user ? (
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-cream-100/70">
                Signed in as <span className="font-semibold text-cream-100">{user.email}</span>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-cream-100/70">
                  Email
                  <input
                    className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-cream-100 outline-none placeholder:text-cream-100/40 focus:border-rose-200/70"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    placeholder="her@email.com"
                  />
                </label>

                <SoftButton className="w-full" onClick={() => void handleSignIn()} disabled={status === "loading"}>
                  Send magic link
                </SoftButton>
              </div>
            )}

            {user ? (
              <div className="mt-5">
                <SoftButton variant="ghost" onClick={() => void handleSignOut()} disabled={status === "loading"}>
                  Sign out
                </SoftButton>
              </div>
            ) : null}
          </GlassCard>

          <GlassCard>
            <p className="font-display text-3xl font-semibold text-cream-100">Backup controls</p>
            <p className="mt-2 text-sm leading-6 text-cream-100/60">
              Cloud sync stores one encrypted-at-rest JSON care package in your Supabase database under the signed-in user.
            </p>

            {notice ? (
              <div
                className={`mt-5 rounded-3xl border p-4 text-sm leading-6 ${
                  status === "error"
                    ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
                    : "border-white/10 bg-white/[0.055] text-cream-100/70"
                }`}
              >
                {notice}
              </div>
            ) : null}

            {cloudUpdatedAt ? (
              <p className="mt-4 text-sm text-cream-100/55">
                Last cloud backup: {new Date(cloudUpdatedAt).toLocaleString()}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SoftButton onClick={() => void handleSaveToCloud()} disabled={!user || status === "loading"}>
                Save to cloud
              </SoftButton>

              <SoftButton variant="secondary" onClick={() => void handleCheckCloud()} disabled={!user || status === "loading"}>
                Check backup
              </SoftButton>

              <SoftButton variant="secondary" onClick={() => void handleRestoreFromCloud()} disabled={!user || status === "loading"}>
                Restore from cloud
              </SoftButton>

              <SoftButton variant="ghost" onClick={() => void handleDeleteCloud()} disabled={!user || status === "loading"}>
                Delete cloud backup
              </SoftButton>
            </div>
          </GlassCard>
        </div>
      )}
    </section>
  );
}
