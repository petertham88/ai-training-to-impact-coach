import Link from "next/link";
import { getParticipants } from "@/lib/queries";
import { getCurrentParticipant } from "@/lib/participant";
import ParticipantSwitcher from "./ParticipantSwitcher";

export default async function Header() {
  let participants = [] as Awaited<ReturnType<typeof getParticipants>>;
  let currentId: string | null = null;
  try {
    participants = await getParticipants();
    const current = await getCurrentParticipant();
    currentId = current?.id ?? null;
  } catch {
    // header stays usable even if data layer hiccups
  }

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span
              className="grid place-items-center rounded-lg text-white font-bold"
              style={{ background: "var(--brand)", width: 26, height: 26, fontSize: 13 }}
            >
              ✦
            </span>
            <span className="font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Impact Coach
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <NavLink href="/" label="My Workflows" />
            <NavLink href="/playbooks" label="Playbooks" />
            <NavLink href="/manager" label="Manager" />
            <NavLink href="/admin" label="Admin" />
          </nav>
        </div>
        {participants.length > 0 && (
          <ParticipantSwitcher participants={participants} currentId={currentId} />
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-2.5 py-1.5 rounded-md no-underline"
      style={{ color: "var(--muted)", fontWeight: 600 }}
    >
      {label}
    </Link>
  );
}
