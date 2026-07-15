import Link from "next/link";
import { redirect } from "next/navigation";
import { isTrainer, trainerEmail } from "@/lib/trainer";
import { getOverview, getRecentAuditLogs } from "@/lib/queries";
import { STEPS } from "@/lib/types";
import { trainerLogout } from "./actions";
import { saveCoachingNote } from "@/app/actions";

export const dynamic = "force-dynamic";

function ago(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function AdminPage() {
  // Server-side gate — /admin is never rendered without a trainer session.
  if (!(await isTrainer())) redirect("/admin/login");

  const overview = await getOverview();
  const logs = await getRecentAuditLogs(50);
  const stepLabel = (n: number) =>
    n === 0 ? "Not started" : `Step ${n} · ${STEPS.find((s) => s.n === n)?.label ?? ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="badge badge-brand">Trainer</span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Adoption dashboard</h1>
          <p className="muted text-sm">Signed in as {trainerEmail()}</p>
        </div>
        <form action={trainerLogout}>
          <button className="btn btn-ghost" type="submit">Sign out</button>
        </form>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile label="Participants" value={overview.totals.participants} />
        <Tile label="Active workflows" value={overview.totals.activeWorkflows} />
        <Tile label="Completed playbooks" value={overview.totals.completedPlaybooks} />
        <Tile label="Hours saved / wk" value={overview.totals.hoursSaved.toFixed(1)} />
      </section>

      {/* Stuck participants */}
      {overview.rollups.some((r) => r.stuck) && (
        <section className="card p-4" style={{ background: "var(--amber-tint)", borderColor: "transparent" }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: "var(--amber)" }}>
            ⚠ Stuck participants (7+ days inactive, workflow incomplete)
          </h2>
          <ul className="text-sm space-y-1">
            {overview.rollups.filter((r) => r.stuck).map((r) => (
              <li key={r.participant.id}>
                {r.participant.full_name} — {stepLabel(r.currentStep)}, last active {ago(r.lastActivity)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Participant table */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Participants</h2>
        <div className="space-y-2">
          {overview.rollups.map((r) => (
            <div key={r.participant.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {r.participant.full_name}
                    {r.stuck && <span className="badge badge-amber ml-2">stuck</span>}
                    {r.completedCount > 0 && <span className="badge badge-green ml-2">{r.completedCount} completed</span>}
                  </p>
                  <p className="muted text-xs mt-0.5">
                    {r.participant.cohort ?? "—"} · {r.participant.department ?? "—"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{stepLabel(r.currentStep)}</p>
                  <p className="muted text-xs">
                    {r.hoursSaved.toFixed(1)}h/wk saved · active {ago(r.lastActivity)}
                  </p>
                </div>
              </div>
              <details className="mt-3">
                <summary className="text-xs link cursor-pointer">Coaching note</summary>
                <form action={saveCoachingNote} className="mt-2 flex gap-2">
                  <input type="hidden" name="participant_id" value={r.participant.id} />
                  <input type="hidden" name="actor_email" value={trainerEmail()} />
                  <input type="hidden" name="back" value="/admin" />
                  <input
                    name="coaching_notes"
                    defaultValue={r.coachingNote}
                    className="input"
                    placeholder="Private note for this participant…"
                  />
                  <button type="submit" className="btn btn-ghost whitespace-nowrap">Save</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases ranked by time saved */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Use cases by time saved</h2>
        <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {overview.useCaseRows.map((row) => (
            <div key={row.useCase.id} className="p-3 flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{row.useCase.title}</p>
                <p className="muted text-xs">{row.participantName} · {row.useCase.status}</p>
              </div>
              <span className="badge badge-brand whitespace-nowrap">{row.hoursSaved.toFixed(1)}h/wk</span>
            </div>
          ))}
        </div>
      </section>

      {/* Audit log */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Recent activity (audit log)</h2>
        <div className="card p-3 text-xs" style={{ maxHeight: 320, overflowY: "auto" }}>
          {logs.length === 0 ? (
            <p className="muted">No activity yet.</p>
          ) : (
            <ul className="space-y-1">
              {logs.map((l) => (
                <li key={l.id} className="flex gap-2">
                  <span className="muted whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</span>
                  <span className="font-mono">{l.action}</span>
                  {l.object_type && <span className="muted">{l.object_type}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs muted mt-0.5">{label}</div>
    </div>
  );
}
