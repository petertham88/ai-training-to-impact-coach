import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant";
import { createClient } from "@/lib/supabase/server";
import {
  getWorkProblems,
  getWorkflowProgress,
  getPlaybooksForParticipant,
} from "@/lib/queries";
import StepProgress from "./components/StepProgress";
import { STEPS } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  identified: "Identified",
  in_progress: "In progress",
  use_case_defined: "Use case defined",
  playbook_saved: "Playbook saved",
  completed: "Completed",
};

export default async function Home() {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  const supabase = await createClient();
  const problems = await getWorkProblems(participant.id, supabase);
  const progresses = await Promise.all(
    problems.map((p) => getWorkflowProgress(p.id, supabase)),
  );
  const playbooks = await getPlaybooksForParticipant(participant.id, supabase);

  const completedCount = progresses.filter(
    (p) => p && p.completedThrough >= 6,
  ).length;
  const hoursSaved = progresses.reduce(
    (sum, p) => sum + (p?.outcome?.time_saved_per_week_hours ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide muted">
            {participant.cohort ?? "Participant"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {participant.full_name}&rsquo;s AI workflows
          </h1>
          <p className="muted text-sm mt-1">
            {participant.job_title ?? ""}
            {participant.department ? ` · ${participant.department}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/problems/new" className="btn btn-primary">
            + Start a new workflow
          </Link>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Work problems" value={problems.length} />
        <Stat label="Completed" value={completedCount} />
        <Stat label="Playbooks" value={playbooks.length} />
        <Stat
          label="Hours saved / wk"
          value={hoursSaved ? hoursSaved.toFixed(1) : "0"}
        />
      </section>

      {/* Workflow list */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide muted">
          Your workflows
        </h2>

        {problems.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-semibold mb-1">No workflows yet</p>
            <p className="muted text-sm mb-4">
              Turn a real, time-consuming task into a tested AI playbook in 6
              guided steps.
            </p>
            <Link href="/problems/new" className="btn btn-primary">
              + Start your first workflow
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((p, i) => {
              const prog = progresses[i];
              const through = prog?.completedThrough ?? 1;
              const current = prog?.currentStep ?? 2;
              const nextStep = STEPS.find((s) => s.n === current);
              return (
                <Link
                  key={p.id}
                  href={`/problems/${p.id}`}
                  className="card p-4 block no-underline hover:shadow-sm"
                  style={{ color: "var(--text)" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{p.title}</h3>
                      {p.frequency && (
                        <p className="muted text-xs mt-0.5">
                          {p.frequency}
                          {p.estimated_time_per_week_hours
                            ? ` · ~${p.estimated_time_per_week_hours}h/wk`
                            : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className={`badge ${
                        p.status === "completed"
                          ? "badge-green"
                          : p.status === "identified"
                            ? ""
                            : "badge-brand"
                      }`}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <StepProgress
                    completedThrough={through}
                    currentStep={current}
                  />
                  <p className="text-xs muted mt-3">
                    {through >= 6 ? (
                      <span style={{ color: "var(--green)" }}>
                        ✓ All 6 steps complete
                      </span>
                    ) : (
                      <>Next: Step {current} — {nextStep?.verb}</>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs muted mt-0.5">{label}</div>
    </div>
  );
}
