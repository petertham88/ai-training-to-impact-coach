import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkflowProgress, getParticipant } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { STEPS } from "@/lib/types";
import StepProgress from "@/app/components/StepProgress";
import {
  ProblemStep,
  UseCaseStep,
  PromptsStep,
  ExperimentStep,
  PlaybookStep,
  OutcomeStep,
} from "./steps";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; done?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const progress = await getWorkflowProgress(id, supabase);
  if (!progress) notFound();

  const participant = await getParticipant(
    progress.problem.participant_id,
    supabase,
  );
  const requested = sp.step ? parseInt(sp.step, 10) : progress.currentStep;
  // clamp: can view any step up to (and including) the current unlocked one
  const activeStep = Math.min(
    Math.max(Number.isFinite(requested) ? requested : progress.currentStep, 1),
    6,
  );
  const locked = activeStep > progress.currentStep;
  const stepMeta = STEPS.find((s) => s.n === activeStep)!;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="link text-sm">
          ← All workflows
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {progress.problem.title}
            </h1>
            <p className="muted text-sm mt-1">
              {participant?.full_name}
              {participant?.department ? ` · ${participant.department}` : ""}
            </p>
          </div>
          {progress.completedThrough >= 6 && (
            <span className="badge badge-green">✓ Workflow complete</span>
          )}
        </div>
      </div>

      {sp.done === "1" && progress.outcome && (
        <div
          className="card p-4"
          style={{ background: "var(--green-tint)", borderColor: "transparent" }}
        >
          <p className="font-semibold" style={{ color: "var(--green)" }}>
            🎉 Outcome recorded — this workflow is complete end-to-end.
          </p>
          <p className="text-sm mt-1">{progress.outcome.ai_summary}</p>
        </div>
      )}

      {/* Progress rail */}
      <div className="card p-5">
        <StepProgress
          completedThrough={progress.completedThrough}
          currentStep={progress.currentStep}
          workProblemId={id}
          activeStep={activeStep}
        />
      </div>

      {/* Active step panel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Step {activeStep} · {stepMeta.label}
          </h2>
          <div className="flex gap-2">
            {activeStep > 1 && (
              <Link
                href={`/problems/${id}?step=${activeStep - 1}`}
                className="btn btn-ghost"
              >
                ← Step {activeStep - 1}
              </Link>
            )}
            {activeStep < 6 && activeStep < progress.currentStep && (
              <Link
                href={`/problems/${id}?step=${activeStep + 1}`}
                className="btn btn-ghost"
              >
                Step {activeStep + 1} →
              </Link>
            )}
          </div>
        </div>

        {locked ? (
          <div className="card p-8 text-center">
            <p className="font-semibold mb-1">Step {activeStep} is locked</p>
            <p className="muted text-sm mb-4">
              Finish step {progress.currentStep} first — each step builds on the
              one before it.
            </p>
            <Link
              href={`/problems/${id}?step=${progress.currentStep}`}
              className="btn btn-primary"
            >
              Go to step {progress.currentStep} →
            </Link>
          </div>
        ) : (
          <StepBody progress={progress} activeStep={activeStep} />
        )}
      </section>
    </div>
  );
}

function StepBody({
  progress,
  activeStep,
}: {
  progress: NonNullable<Awaited<ReturnType<typeof getWorkflowProgress>>>;
  activeStep: number;
}) {
  switch (activeStep) {
    case 1:
      return <ProblemStep progress={progress} />;
    case 2:
      return <UseCaseStep progress={progress} />;
    case 3:
      return <PromptsStep progress={progress} />;
    case 4:
      return <ExperimentStep progress={progress} />;
    case 5:
      return <PlaybookStep progress={progress} />;
    case 6:
      return <OutcomeStep progress={progress} />;
    default:
      return null;
  }
}
