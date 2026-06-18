import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type CloudCarePackage = {
  data: unknown;
  updatedAt: string;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getCurrentUser(): Promise<User | null> {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function signInWithEmail(email: string): Promise<void> {
  const client = requireSupabase();

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/sync`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutOfCloud(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveCloudPackage(data: unknown): Promise<void> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before saving to cloud.");
  }

  const { error } = await client.from("care_packages").upsert(
    {
      user_id: user.id,
      data,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadCloudPackage(): Promise<CloudCarePackage | null> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before restoring from cloud.");
  }

  const { data, error } = await client
    .from("care_packages")
    .select("data, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    data: data.data,
    updatedAt: String(data.updated_at),
  };
}

export async function deleteCloudPackage(): Promise<void> {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Sign in before deleting cloud data.");
  }

  const { error } = await client.from("care_packages").delete().eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
