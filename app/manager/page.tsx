import Link from "next/link";
import { getOverview, getOutcomeRows } from "@/lib/queries";
import { STEPS } from "@/lib/types";
import { verifyOutcome } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const overview = await getOverview();
  const outcomeRows = await getOutcomeRows();

  // Cohort-level stats: started / completed / stalled
  const byCohort = new Map<
    string,
    { started: number; completed: number; stalled: number; hours: number }
  >();
  for (const r of overview.rollups) {
    const key = r.participant.cohort ?? "Unassigned";
    const c = byCohort.get(key) ?? { started: 0, completed: 0, stalled: 0, hours: 0 };
    if (r.problemCount > 0) c.started += 1;
    if (r.completedCount > 0) c.completed += 1;
    if (r.stuck) c.stalled += 1;
    c.hours += r.hoursSaved;
    byCohort.set(key, c);
  }

  const stepLabel = (n: number) =>
    n === 0 ? "Not started" : `Step ${n} · ${STEPS.find((s) => s.n === n)?.label ?? ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manager &amp; HR view</h1>
          <p className="muted text-sm mt-1">Team adoption, outcomes and cohort reporting.</p>
        </div>
        <a href="/manager/export" className="btn btn-ghost">⬇ Export outcomes (CSV)</a>
      </div>

      {/* Cohort summary */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Cohort summary</h2>
        <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {[...byCohort.entries()].map(([cohort, c]) => (
            <div key={cohort} className="p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-sm">{cohort}</span>
              <div className="flex gap-2">
                <span className="badge">{c.started} started</span>
                <span className="badge badge-green">{c.completed} completed</span>
                <span className="badge badge-amber">{c.stalled} stalled</span>
                <span className="badge badge-brand">{c.hours.toFixed(1)}h/wk</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team stages */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Team members</h2>
        <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {overview.rollups.map((r) => (
            <div key={r.participant.id} className="p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{r.participant.full_name}</p>
                <p className="muted text-xs">{r.participant.department ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{stepLabel(r.currentStep)}</p>
                <p className="muted text-xs">{r.hoursSaved.toFixed(1)}h/wk saved</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Outcome verification */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Outcomes — verify results</h2>
        {outcomeRows.length === 0 ? (
          <div className="card p-6 text-center muted text-sm">No recorded outcomes yet.</div>
        ) : (
          <div className="space-y-2">
            {outcomeRows.map((row) => (
              <div key={row.outcome.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.playbookTitle}</p>
                  <p className="muted text-xs">
                    {row.participant?.full_name ?? "—"} · {row.outcome.time_saved_per_week_hours ?? 0}h/wk ·{" "}
                    confidence {row.outcome.confidence_level ?? "—"}
                  </p>
                  {row.outcome.business_result && (
                    <p className="text-sm mt-1">{row.outcome.business_result}</p>
                  )}
                </div>
                <form action={verifyOutcome}>
                  <input type="hidden" name="id" value={row.outcome.id} />
                  <input type="hidden" name="verified" value={row.outcome.verified_by_manager ? "false" : "true"} />
                  <input type="hidden" name="back" value="/manager" />
                  {row.outcome.verified_by_manager ? (
                    <button className="btn btn-ghost" type="submit">✓ Verified — undo</button>
                  ) : (
                    <button className="btn btn-primary" type="submit">Mark verified</button>
                  )}
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
