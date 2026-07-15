import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlaybookDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPlaybookDetail(id);
  if (!detail) notFound();
  const { playbook, useCase, winningPrompt, outcome, participant } = detail;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/playbooks" className="link text-sm">← Playbook library</Link>
        <div className="flex flex-wrap items-start justify-between gap-2 mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{playbook.title}</h1>
            <p className="muted text-sm mt-1">
              {participant?.full_name ?? "—"}
              {participant?.cohort ? ` · ${participant.cohort}` : ""}
            </p>
          </div>
          <span className={`badge ${playbook.status === "active" ? "badge-green" : ""}`}>
            {playbook.status}
          </span>
        </div>
      </div>

      {outcome && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Time saved / wk" value={outcome.time_saved_per_week_hours != null ? `${outcome.time_saved_per_week_hours}h` : "—"} />
          <Metric label="Confidence" value={outcome.confidence_level ?? "—"} />
          <Metric label="Manager verified" value={outcome.verified_by_manager ? "Yes" : "No"} />
          <Metric label="Tools" value={playbook.tools_used ?? "—"} />
        </div>
      )}

      {outcome?.ai_summary && (
        <div className="card p-4" style={{ background: "var(--green-tint)", borderColor: "transparent" }}>
          <p className="text-xs font-semibold badge badge-green mb-2">✦ Outcome summary</p>
          <p className="text-sm">{outcome.ai_summary}</p>
        </div>
      )}

      <Section title="The workflow">
        {playbook.workflow_steps ? (
          <pre className="text-sm whitespace-pre-wrap font-sans">{playbook.workflow_steps}</pre>
        ) : (
          <p className="muted text-sm">No steps recorded.</p>
        )}
      </Section>

      {winningPrompt && (
        <Section title={`Winning prompt (v${winningPrompt.version})`}>
          <pre className="text-sm whitespace-pre-wrap font-sans card p-3" style={{ background: "var(--surface-2)" }}>
            {winningPrompt.prompt_text}
          </pre>
        </Section>
      )}

      {useCase && (
        <Section title="Use case">
          <p className="text-sm">{useCase.objective ?? useCase.title}</p>
          {useCase.expected_benefit && (
            <p className="muted text-sm mt-1">Expected: {useCase.expected_benefit}</p>
          )}
        </Section>
      )}

      {playbook.lessons_learned && (
        <Section title="Lessons learned">
          <p className="text-sm">{playbook.lessons_learned}</p>
        </Section>
      )}

      {outcome?.business_result && (
        <Section title="Business result">
          <p className="text-sm">{outcome.business_result}</p>
          {outcome.measurement_method && (
            <p className="muted text-xs mt-1">Measured: {outcome.measurement_method}</p>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide muted mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs muted">{label}</div>
    </div>
  );
}
