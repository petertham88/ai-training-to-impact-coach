"use client";

import { useRef } from "react";
import { setActiveParticipant } from "@/app/actions";
import type { Participant } from "@/lib/types";

export default function ParticipantSwitcher({
  participants,
  currentId,
}: {
  participants: Participant[];
  currentId: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={setActiveParticipant} className="flex items-center gap-2">
      <span className="text-xs muted hidden sm:inline">Acting as</span>
      <select
        name="participant_id"
        defaultValue={currentId ?? ""}
        className="select"
        style={{ width: "auto", padding: "0.4rem 0.6rem", fontSize: "0.82rem" }}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {participants.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name} · {p.department ?? "—"}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn btn-ghost">Switch</button>
      </noscript>
    </form>
  );
}
