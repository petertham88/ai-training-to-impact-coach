import { cookies } from "next/headers";
import { getParticipants, getParticipant } from "@/lib/queries";
import { getAuthUser, ensureParticipant } from "@/lib/auth";
import type { Participant } from "@/lib/types";

const COOKIE = "demo_participant_id";

// The participant for the signed-in user (linked/created on first use).
// The main app is behind the auth wall, so this is the source of identity.
export async function getCurrentParticipant(): Promise<Participant | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return ensureParticipant(user);
}

export async function getCurrentParticipantId(): Promise<string | null> {
  const p = await getCurrentParticipant();
  return p?.id ?? null;
}

// Read-only participant used by the public /demo showcase (no auth). A cookie
// remembers which seeded participant to preview; defaults to the first.
export async function getDemoParticipant(): Promise<Participant | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (id) {
    const p = await getParticipant(id);
    if (p) return p;
  }
  const all = await getParticipants();
  return all[0] ?? null;
}

export const PARTICIPANT_COOKIE = COOKIE;
