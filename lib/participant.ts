import { cookies } from "next/headers";
import { getParticipants, getParticipant } from "@/lib/queries";
import type { Participant } from "@/lib/types";

const COOKIE = "demo_participant_id";

// Resolve the "acting" participant for the demo-first experience.
// v1 has no login wall: a cookie remembers which seeded participant you are,
// defaulting to the first one. This lets the whole 6-step flow work for anyone.
export async function getCurrentParticipant(): Promise<Participant | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;

  if (id) {
    const p = await getParticipant(id);
    if (p) return p;
  }
  // Fall back to the first seeded participant.
  const all = await getParticipants();
  return all[0] ?? null;
}

export async function getCurrentParticipantId(): Promise<string | null> {
  const p = await getCurrentParticipant();
  return p?.id ?? null;
}

export const PARTICIPANT_COOKIE = COOKIE;
