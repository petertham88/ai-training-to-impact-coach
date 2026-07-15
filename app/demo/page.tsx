import Link from "next/link";
import {
  getParticipants,
  getWorkProblems,
  getWorkflowProgress,
  getAllPlaybooks,
  getParticipant,
  getOutcomeForPlaybook,
} from "@/lib/queries";
import StepProgress from "@/app/components/StepProgress";

export const dynamic = "force-dynamic";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const sp = await searchParams;
  const participants = await getParticipants();
  const active =
    participants.find((x) => x.id === sp.p) ?? participants[0] ?? null;

  const problems = active ? await getWorkProblems(active.id) : [];
  const progresses = await Promise.all(
    problems.map((p) => getWorkflowProgress(p.id)),
  );
  const playbooks = await getAllPlaybooks();
  const pbEnriched = await Promise.all(
    playbooks.slice(0, 6).map(async (pb) => ({
      pb,
      participant: await getParticipant(pb.participant_id),
      outcome: await getOutcomeForPlaybook(pb.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: "var(--brand-tint)", borderColor: "transparent" }}>
        <div>
          <p className="font-semibold">You&rsquo;re viewing the public demo</p>
          <p className="muted text-sm">Read-only sample data. Sign in to build your own workflows.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Create account</Link>
        </div>
      </div>

      {participants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Link
              key={p.id}
              href={`/demo?p=${p.id}`}
              className={`badge ${active?.id === p.id ? "badge-brand" : ""}`}
              style={{ padding: "0.4rem 0.7rem" }}
            >
              {p.full_name}
            </Link>
          ))}
        </div>
      )}

      {active && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide muted">
            {active.full_name}&rsquo;s workflows
          </h2>
          {problems.length === 0 ? (
            <div className="card p-6 text-center muted text-sm">No workflows.</div>
          ) : (
            problems.map((p, i) => {
              const prog = progresses[i];
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{p.title}</h3>
                    <span className="badge">{p.status}</span>
                  </div>
                  <StepProgress
                    completedThrough={prog?.completedThrough ?? 1}
                    currentStep={prog?.currentStep ?? 2}
                  />
                </div>
              );
            })
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">Proven playbooks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pbEnriched.map(({ pb, participant, outcome }) => (
            <div key={pb.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-green">{pb.status}</span>
                {outcome?.time_saved_per_week_hours != null && (
                  <span className="badge badge-brand">{outcome.time_saved_per_week_hours}h/wk saved</span>
                )}
              </div>
              <h3 className="font-semibold">{pb.title}</h3>
              <p className="muted text-xs mt-1">{participant?.full_name ?? "—"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
