import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/supabase/data";
import type { Participant } from "@/lib/types";

// The authenticated Supabase user for this request, or null.
export async function getAuthUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

// Find (or link/create) the participant row that belongs to the signed-in user.
// Runs through the session-bound client so writes satisfy owner RLS once applied.
export async function ensureParticipant(user: User): Promise<Participant | null> {
  const supabase = await createClient();
  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    email.split("@")[0] ||
    "Participant";

  return withRetry(async () => {
    // 1) already linked by user_id?
    const linked = await supabase
      .from("participants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (linked.data) return linked.data as Participant;

    // 2) an existing (e.g. seeded) participant with this email → claim it
    if (email) {
      const byEmail = await supabase
        .from("participants")
        .select("*")
        .eq("email", email)
        .is("user_id", null)
        .limit(1)
        .maybeSingle();
      if (byEmail.data) {
        const claimed = await supabase
          .from("participants")
          .update({ user_id: user.id })
          .eq("id", (byEmail.data as Participant).id)
          .select("*")
          .single();
        if (claimed.data) return claimed.data as Participant;
      }
    }

    // 3) create a fresh participant for this user
    const created = await supabase
      .from("participants")
      .insert({
        user_id: user.id,
        full_name: fullName,
        email,
        cohort:
          (user.user_metadata?.cohort as string | undefined) ?? "New sign-ups",
        job_title: (user.user_metadata?.job_title as string | undefined) ?? null,
        department:
          (user.user_metadata?.department as string | undefined) ?? null,
      })
      .select("*")
      .single();
    if (created.error) throw created.error;
    return (created.data as Participant) ?? null;
  });
}
