import Link from "next/link";
import type { WorkflowProgress } from "@/lib/types";
import { suggestUseCase } from "@/lib/ai";
import ConfirmButton from "@/app/components/ConfirmButton";
import {
  updateWorkProblem,
  deleteWorkProblem,
  saveUseCase,
  generateUseCaseSuggestion,
  reviewUseCaseSuggestion,
  createPrompt,
  ratePrompt,
  setWinningPrompt,
  improvePrompt,
  createExperiment,
  savePlaybook,
  recordOutcome,
} from "@/app/actions";

type P = { progress: WorkflowProgress };

function ContinueLink({ id, to }: { id: string; to: number }) {
  return (
    <Link href={`/problems/${id}?step=${to}`} className="btn btn-primary">
      Continue to Step {to} →
    </Link>
  );
}

// ── Step 1: Work problem ────────────────────────────────────────────────────
export function ProblemStep({ progress }: P) {
  const p = progress.problem;
  return (
    <div className="space-y-4">
      <form action={updateWorkProblem} className="card p-5 space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <div>
          <label className="label">Task title *</label>
          <input name="title" required defaultValue={p.title} className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" defaultValue={p.description ?? ""} className="textarea" />
        </div>
        <div>
          <label className="label">Current process</label>
          <textarea name="current_process" defaultValue={p.current_process ?? ""} className="textarea" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Frequency</label>
            <input name="frequency" defaultValue={p.frequency ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Hours per week</label>
            <input
              name="estimated_time_per_week_hours"
              type="number"
              step="0.5"
              min="0"
              defaultValue={p.estimated_time_per_week_hours ?? ""}
              className="input"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-ghost">Save changes</button>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <form action={deleteWorkProblem}>
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message="Delete this workflow and all its steps? This cannot be undone.">
            Delete workflow
          </ConfirmButton>
        </form>
        <ContinueLink id={p.id} to={2} />
      </div>
    </div>
  );
}

// ── Step 2: Use case ────────────────────────────────────────────────────────
export function UseCaseStep({ progress }: P) {
  const p = progress.problem;
  const uc = progress.useCase;
  const aiHint = suggestUseCase(p.title, p.current_process);

  return (
    <div className="space-y-4">
      {!uc && (
        <div className="card p-4" style={{ background: "var(--brand-tint)", borderColor: "transparent" }}>
          <p className="text-xs font-semibold badge badge-brand mb-2">✦ AI suggestion (draft)</p>
          <p className="text-sm">{aiHint.value}</p>
          <p className="text-xs muted mt-2">
            Source: {aiHint.source} · confidence {(aiHint.confidence * 100).toFixed(0)}%. Use it as a
            starting point below — you decide what to keep.
          </p>
        </div>
      )}

      <form action={saveUseCase} className="card p-5 space-y-4">
        {uc && <input type="hidden" name="id" value={uc.id} />}
        <input type="hidden" name="work_problem_id" value={p.id} />
        <input type="hidden" name="participant_id" value={p.participant_id} />
        <div>
          <label className="label">Use case title *</label>
          <input
            name="title"
            required
            defaultValue={uc?.title ?? ""}
            className="input"
            placeholder="e.g. AI-drafted ops status report"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">AI tool</label>
            <input name="ai_tool" defaultValue={uc?.ai_tool ?? ""} className="input" placeholder="ChatGPT, Claude…" />
          </div>
          <div>
            <label className="label">Expected benefit</label>
            <input name="expected_benefit" defaultValue={uc?.expected_benefit ?? ""} className="input" placeholder="Save 2.5 hrs/week" />
          </div>
        </div>
        <div>
          <label className="label">Objective</label>
          <textarea
            name="objective"
            defaultValue={uc?.objective ?? ""}
            className="textarea"
            placeholder="What should the AI do, with what input, to produce what output?"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" className="btn btn-primary">
            {uc ? "Save use case" : "Create use case →"}
          </button>
        </div>
      </form>

      {uc && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">✦ AI assist</h3>
            {uc.ai_suggestion_review_status &&
              uc.ai_suggestion_review_status !== "unreviewed" && (
                <span className="badge">{uc.ai_suggestion_review_status}</span>
              )}
          </div>

          {uc.ai_suggestion && uc.ai_suggestion_review_status === "unreviewed" ? (
            <div className="space-y-3">
              <div className="card p-3" style={{ background: "var(--surface-2)" }}>
                <p className="text-sm">{uc.ai_suggestion}</p>
                <p className="text-xs muted mt-2">
                  {uc.ai_suggestion_source} · confidence{" "}
                  {uc.ai_suggestion_confidence != null
                    ? (uc.ai_suggestion_confidence * 100).toFixed(0) + "%"
                    : "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={reviewUseCaseSuggestion}>
                  <input type="hidden" name="work_problem_id" value={p.id} />
                  <input type="hidden" name="use_case_id" value={uc.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="btn btn-primary" type="submit">Approve → add to objective</button>
                </form>
                <form action={reviewUseCaseSuggestion}>
                  <input type="hidden" name="work_problem_id" value={p.id} />
                  <input type="hidden" name="use_case_id" value={uc.id} />
                  <input type="hidden" name="decision" value="dismiss" />
                  <button className="btn btn-ghost" type="submit">Dismiss</button>
                </form>
              </div>
            </div>
          ) : (
            <form action={generateUseCaseSuggestion}>
              <input type="hidden" name="work_problem_id" value={p.id} />
              <input type="hidden" name="use_case_id" value={uc.id} />
              <input type="hidden" name="problem_title" value={p.title} />
              <input type="hidden" name="current_process" value={p.current_process ?? ""} />
              <button className="btn btn-ghost" type="submit">✦ Draft a suggestion with AI</button>
            </form>
          )}
        </div>
      )}

      {uc && (
        <div className="flex justify-end">
          <ContinueLink id={p.id} to={3} />
        </div>
      )}
    </div>
  );
}

// ── Step 3: Prompts ─────────────────────────────────────────────────────────
export function PromptsStep({ progress }: P) {
  const p = progress.problem;
  const uc = progress.useCase!;
  const prompts = progress.prompts;
  const latest = prompts[prompts.length - 1];

  return (
    <div className="space-y-4">
      {prompts.length > 0 ? (
        <div className="space-y-3">
          {prompts.map((pr) => (
            <div key={pr.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-brand">v{pr.version}</span>
                  <span className={`badge ${pr.status === "winning" ? "badge-green" : ""}`}>
                    {pr.status}
                  </span>
                  {pr.ai_improvement_source && (
                    <span className="badge">✦ AI draft</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <form action={ratePrompt} className="flex items-center gap-1">
                    <input type="hidden" name="work_problem_id" value={p.id} />
                    <input type="hidden" name="id" value={pr.id} />
                    <select
                      name="rating"
                      defaultValue={pr.rating ?? ""}
                      className="select"
                      style={{ width: "auto", padding: "0.3rem 0.4rem", fontSize: "0.78rem" }}
                    >
                      <option value="">Rate</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{"★".repeat(n)}</option>
                      ))}
                    </select>
                    <button className="btn btn-ghost" type="submit" style={{ padding: "0.35rem 0.6rem" }}>
                      Save
                    </button>
                  </form>
                  {pr.status !== "winning" && (
                    <form action={setWinningPrompt}>
                      <input type="hidden" name="work_problem_id" value={p.id} />
                      <input type="hidden" name="use_case_id" value={uc.id} />
                      <input type="hidden" name="id" value={pr.id} />
                      <button className="btn btn-ghost" type="submit" style={{ padding: "0.35rem 0.6rem" }}>
                        ★ Mark winning
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: "var(--text)" }}>
                {pr.prompt_text}
              </pre>
              {pr.notes && <p className="text-xs muted mt-2">{pr.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center muted text-sm">
          No prompt versions yet. Draft your first one below.
        </div>
      )}

      <form action={createPrompt} className="card p-5 space-y-3">
        <input type="hidden" name="work_problem_id" value={p.id} />
        <input type="hidden" name="use_case_id" value={uc.id} />
        <input type="hidden" name="participant_id" value={p.participant_id} />
        <div>
          <label className="label">
            New prompt version {prompts.length ? `(v${prompts.length + 1})` : "(v1)"}
          </label>
          <textarea
            name="prompt_text"
            required
            className="textarea"
            style={{ minHeight: 120 }}
            placeholder="Write the prompt you'll test. Include a role, the task, an input placeholder, and the output format."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Notes (optional)</label>
            <input name="notes" className="input" placeholder="What are you trying this time?" />
          </div>
          <div>
            <label className="label">Initial rating</label>
            <select name="rating" className="select">
              <option value="">Not yet rated</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} ★</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">+ Save prompt version</button>
        </div>
      </form>

      {latest && (
        <form action={improvePrompt} className="card p-4 flex items-center justify-between gap-3"
          style={{ background: "var(--brand-tint)", borderColor: "transparent" }}>
          <div className="text-sm">
            <p className="font-semibold">✦ Improve v{latest.version} with AI</p>
            <p className="muted text-xs">Creates a new draft version with structured refinements you can edit.</p>
          </div>
          <input type="hidden" name="work_problem_id" value={p.id} />
          <input type="hidden" name="use_case_id" value={uc.id} />
          <input type="hidden" name="participant_id" value={p.participant_id} />
          <input type="hidden" name="prompt_text" value={latest.prompt_text} />
          <input type="hidden" name="experiment_notes" value={progress.experiments[0]?.what_failed ?? ""} />
          <button type="submit" className="btn btn-ghost whitespace-nowrap">✦ Suggest improvement</button>
        </form>
      )}

      {prompts.length > 0 && (
        <div className="flex justify-end">
          <ContinueLink id={p.id} to={4} />
        </div>
      )}
    </div>
  );
}

// ── Step 4: Experiment ──────────────────────────────────────────────────────
export function ExperimentStep({ progress }: P) {
  const p = progress.problem;
  const uc = progress.useCase!;
  const prompts = progress.prompts;

  return (
    <div className="space-y-4">
      {progress.experiments.length > 0 && (
        <div className="space-y-3">
          {progress.experiments.map((ex) => {
            const pr = prompts.find((x) => x.id === ex.prompt_id);
            return (
              <div key={ex.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-brand">
                    {ex.run_date ?? "Run"}{pr ? ` · prompt v${pr.version}` : ""}
                  </span>
                  <span className="badge">{ex.output_quality ?? ex.status}</span>
                </div>
                {ex.what_worked && (
                  <p className="text-sm"><span style={{ color: "var(--green)" }}>✓ Worked:</span> {ex.what_worked}</p>
                )}
                {ex.what_failed && (
                  <p className="text-sm mt-1"><span style={{ color: "var(--red)" }}>✗ Failed:</span> {ex.what_failed}</p>
                )}
                {ex.iteration_notes && <p className="text-xs muted mt-2">Next: {ex.iteration_notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      <form action={createExperiment} className="card p-5 space-y-3">
        <input type="hidden" name="work_problem_id" value={p.id} />
        <input type="hidden" name="use_case_id" value={uc.id} />
        <input type="hidden" name="participant_id" value={p.participant_id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Which prompt did you run?</label>
            <select name="prompt_id" className="select" defaultValue="">
              <option value="">— select version —</option>
              {prompts.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  v{pr.version}{pr.status === "winning" ? " (winning)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Run date</label>
            <input name="run_date" type="date" className="input" />
          </div>
        </div>
        <div>
          <label className="label">What worked?</label>
          <textarea name="what_worked" className="textarea" />
        </div>
        <div>
          <label className="label">What failed?</label>
          <textarea name="what_failed" className="textarea" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Output quality</label>
            <select name="output_quality" className="select" defaultValue="">
              <option value="">—</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Mixed</option>
              <option>Poor</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="select" defaultValue="done">
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Iteration notes (what to try next)</label>
          <input name="iteration_notes" className="input" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">+ Log experiment</button>
        </div>
      </form>

      {progress.experiments.length > 0 && (
        <div className="flex justify-end">
          <ContinueLink id={p.id} to={5} />
        </div>
      )}
    </div>
  );
}

// ── Step 5: Playbook ────────────────────────────────────────────────────────
export function PlaybookStep({ progress }: P) {
  const p = progress.problem;
  const uc = progress.useCase!;
  const pb = progress.playbook;
  const prompts = progress.prompts;
  const winning = prompts.find((x) => x.status === "winning");

  return (
    <div className="space-y-4">
      <form action={savePlaybook} className="card p-5 space-y-4">
        {pb && <input type="hidden" name="id" value={pb.id} />}
        <input type="hidden" name="work_problem_id" value={p.id} />
        <input type="hidden" name="use_case_id" value={uc.id} />
        <input type="hidden" name="participant_id" value={p.participant_id} />
        <div>
          <label className="label">Playbook title *</label>
          <input
            name="title"
            required
            defaultValue={pb?.title ?? `${uc.title} Playbook`}
            className="input"
          />
        </div>
        <div>
          <label className="label">Workflow steps (the repeatable recipe)</label>
          <textarea
            name="workflow_steps"
            defaultValue={pb?.workflow_steps ?? ""}
            className="textarea"
            style={{ minHeight: 130 }}
            placeholder={"1. …\n2. …\n3. …"}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Winning prompt</label>
            <select
              name="winning_prompt_id"
              className="select"
              defaultValue={pb?.winning_prompt_id ?? winning?.id ?? ""}
            >
              <option value="">— none —</option>
              {prompts.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  v{pr.version}{pr.rating ? ` · ${pr.rating}★` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tools used</label>
            <input name="tools_used" defaultValue={pb?.tools_used ?? uc.ai_tool ?? ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Lessons learned</label>
          <textarea name="lessons_learned" defaultValue={pb?.lessons_learned ?? ""} className="textarea" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" className="btn btn-primary">
            {pb ? "Save playbook" : "Save playbook →"}
          </button>
        </div>
      </form>

      {pb && (
        <div className="flex items-center justify-between">
          <Link href={`/playbooks/${pb.id}`} className="link text-sm">
            View published playbook →
          </Link>
          <ContinueLink id={p.id} to={6} />
        </div>
      )}
    </div>
  );
}

// ── Step 6: Outcome ─────────────────────────────────────────────────────────
export function OutcomeStep({ progress }: P) {
  const p = progress.problem;
  const pb = progress.playbook;
  const outcome = progress.outcome;

  if (!pb) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold mb-1">Save a playbook first</p>
        <p className="muted text-sm mb-4">
          Outcomes are recorded against a saved playbook.
        </p>
        <Link href={`/problems/${p.id}?step=5`} className="btn btn-primary">
          Go to Step 5 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outcome?.ai_summary && (
        <div className="card p-4" style={{ background: "var(--green-tint)", borderColor: "transparent" }}>
          <p className="text-xs font-semibold badge badge-green mb-2">✦ AI outcome summary</p>
          <p className="text-sm">{outcome.ai_summary}</p>
        </div>
      )}

      <form action={recordOutcome} className="card p-5 space-y-4">
        {outcome && <input type="hidden" name="id" value={outcome.id} />}
        <input type="hidden" name="work_problem_id" value={p.id} />
        <input type="hidden" name="playbook_id" value={pb.id} />
        <input type="hidden" name="participant_id" value={p.participant_id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Time saved per week (hours) *</label>
            <input
              name="time_saved_per_week_hours"
              type="number"
              step="0.5"
              min="0"
              required
              defaultValue={outcome?.time_saved_per_week_hours ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className="label">Confidence</label>
            <select name="confidence_level" defaultValue={outcome?.confidence_level ?? "medium"} className="select">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Quality improvement</label>
          <textarea name="quality_improvement" defaultValue={outcome?.quality_improvement ?? ""} className="textarea" />
        </div>
        <div>
          <label className="label">Business result</label>
          <textarea name="business_result" defaultValue={outcome?.business_result ?? ""} className="textarea" placeholder="What changed for the business? Numbers if you have them." />
        </div>
        <div>
          <label className="label">How did you measure it?</label>
          <input name="measurement_method" defaultValue={outcome?.measurement_method ?? ""} className="input" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            {outcome ? "Update outcome" : "Record outcome & finish ✓"}
          </button>
        </div>
      </form>

      {outcome && (
        <div className="flex justify-end">
          <Link href={`/playbooks/${pb.id}`} className="btn btn-ghost">
            View published playbook →
          </Link>
        </div>
      )}
    </div>
  );
}
