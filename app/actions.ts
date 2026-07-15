"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db, withRetry } from "@/lib/supabase/data";
import { logAudit } from "@/lib/audit";
import { PARTICIPANT_COOKIE } from "@/lib/participant";
import { getWorkflowProgress } from "@/lib/queries";
import {
  suggestUseCase,
  suggestPromptImprovement,
  summariseOutcome,
} from "@/lib/ai";

// ── helpers ─────────────────────────────────────────────────────────────────

function str(fd: FormData, key: string): string {
  return (fd.get(key) ?? "").toString().trim();
}
function numOrNull(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function statusForStep(completedThrough: number): string {
  if (completedThrough >= 6) return "completed";
  if (completedThrough >= 5) return "playbook_saved";
  if (completedThrough >= 2) return "in_progress";
  return "identified";
}

// Recompute a work problem's status from actual DB state so it never lies.
async function syncProblemStatus(workProblemId: string): Promise<void> {
  const p = await getWorkflowProgress(workProblemId);
  if (!p) return;
  const status = statusForStep(p.completedThrough);
  if (status !== p.problem.status) {
    await db()
      .from("work_problems")
      .update({ status })
      .eq("id", workProblemId);
  }
  // keep use_case status in step too
  if (p.useCase) {
    let ucStatus = "draft";
    if (p.playbook) ucStatus = "completed";
    else if (p.prompts.length > 0 || p.experiments.length > 0)
      ucStatus = "experimenting";
    if (ucStatus !== p.useCase.status) {
      await db().from("use_cases").update({ status: ucStatus }).eq("id", p.useCase.id);
    }
  }
}

// ── participant identity (demo switcher) ────────────────────────────────────

export async function setActiveParticipant(formData: FormData): Promise<void> {
  const id = str(formData, "participant_id");
  const store = await cookies();
  store.set(PARTICIPANT_COOKIE, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function createParticipant(formData: FormData): Promise<void> {
  const full_name = str(formData, "full_name");
  const email = str(formData, "email");
  if (!full_name || !email) return;

  const { data, error } = await withRetry(() =>
    db()
      .from("participants")
      .insert({
        full_name,
        email,
        job_title: str(formData, "job_title") || null,
        department: str(formData, "department") || null,
        manager_email: str(formData, "manager_email") || null,
        cohort: str(formData, "cohort") || null,
      })
      .select("id")
      .single(),
  );
  if (error || !data) throw error ?? new Error("insert failed");

  await logAudit({
    actorEmail: email,
    action: "participant.create",
    objectType: "participant",
    objectId: data.id,
    detail: { full_name, email },
  });

  const store = await cookies();
  store.set(PARTICIPANT_COOKIE, data.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
  redirect("/");
}

// ── Step 1: Work problem ────────────────────────────────────────────────────

export async function createWorkProblem(formData: FormData): Promise<void> {
  const participant_id = str(formData, "participant_id");
  const title = str(formData, "title");
  if (!participant_id || !title) return;

  const { data, error } = await withRetry(() =>
    db()
      .from("work_problems")
      .insert({
        participant_id,
        title,
        description: str(formData, "description") || null,
        current_process: str(formData, "current_process") || null,
        frequency: str(formData, "frequency") || null,
        estimated_time_per_week_hours: numOrNull(
          formData,
          "estimated_time_per_week_hours",
        ),
        status: "identified",
      })
      .select("id")
      .single(),
  );
  if (error || !data) throw error ?? new Error("insert failed");

  await logAudit({
    action: "work_problem.create",
    objectType: "work_problem",
    objectId: data.id,
    detail: { title },
  });

  revalidatePath("/");
  redirect(`/problems/${data.id}`);
}

export async function updateWorkProblem(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  if (!id) return;
  const { error } = await db()
    .from("work_problems")
    .update({
      title: str(formData, "title"),
      description: str(formData, "description") || null,
      current_process: str(formData, "current_process") || null,
      frequency: str(formData, "frequency") || null,
      estimated_time_per_week_hours: numOrNull(
        formData,
        "estimated_time_per_week_hours",
      ),
    })
    .eq("id", id);
  if (error) throw error;

  await logAudit({
    action: "work_problem.update",
    objectType: "work_problem",
    objectId: id,
  });
  revalidatePath(`/problems/${id}`);
  revalidatePath("/");
  redirect(`/problems/${id}`);
}

export async function deleteWorkProblem(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  if (!id) return;

  // Clean up children first (no cascade in v1 schema).
  const useCases = await db()
    .from("use_cases")
    .select("id")
    .eq("work_problem_id", id);
  const ucIds = (useCases.data ?? []).map((u: { id: string }) => u.id);
  if (ucIds.length) {
    const playbooks = await db()
      .from("playbooks")
      .select("id")
      .in("use_case_id", ucIds);
    const pbIds = (playbooks.data ?? []).map((p: { id: string }) => p.id);
    if (pbIds.length) {
      await db().from("outcomes").delete().in("playbook_id", pbIds);
      await db().from("playbooks").delete().in("id", pbIds);
    }
    await db().from("experiments").delete().in("use_case_id", ucIds);
    await db().from("prompts").delete().in("use_case_id", ucIds);
    await db().from("use_cases").delete().in("id", ucIds);
  }
  const { error } = await db().from("work_problems").delete().eq("id", id);
  if (error) throw error;

  await logAudit({
    action: "work_problem.delete",
    objectType: "work_problem",
    objectId: id,
  });
  revalidatePath("/");
  redirect("/");
}

// ── Step 2: Use case ────────────────────────────────────────────────────────

export async function saveUseCase(formData: FormData): Promise<void> {
  const id = str(formData, "id"); // present when editing
  const work_problem_id = str(formData, "work_problem_id");
  const participant_id = str(formData, "participant_id");
  const title = str(formData, "title");
  if (!work_problem_id || !participant_id || !title) return;

  const payload = {
    work_problem_id,
    participant_id,
    title,
    ai_tool: str(formData, "ai_tool") || null,
    objective: str(formData, "objective") || null,
    expected_benefit: str(formData, "expected_benefit") || null,
  };

  if (id) {
    const { error } = await db().from("use_cases").update(payload).eq("id", id);
    if (error) throw error;
    await logAudit({
      action: "use_case.update",
      objectType: "use_case",
      objectId: id,
    });
  } else {
    const { data, error } = await withRetry(() =>
      db()
        .from("use_cases")
        .insert({ ...payload, status: "draft" })
        .select("id")
        .single(),
    );
    if (error || !data) throw error ?? new Error("insert failed");
    await logAudit({
      action: "use_case.create",
      objectType: "use_case",
      objectId: data.id,
      detail: { title },
    });
  }

  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

// Draft an AI use-case suggestion (medium risk → stored unreviewed, needs approve)
export async function generateUseCaseSuggestion(
  formData: FormData,
): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const problem_title = str(formData, "problem_title");
  const current_process = str(formData, "current_process");
  if (!use_case_id) return;

  const s = suggestUseCase(problem_title, current_process);
  const { error } = await db()
    .from("use_cases")
    .update({
      ai_suggestion: s.value,
      ai_suggestion_source: s.source,
      ai_suggestion_confidence: s.confidence,
      ai_suggestion_review_status: "unreviewed",
    })
    .eq("id", use_case_id);
  if (error) throw error;

  await logAudit({
    action: "ai.suggest_use_case",
    objectType: "use_case",
    objectId: use_case_id,
    detail: { input: problem_title, output: s.value, source: s.source, confidence: s.confidence },
  });
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

export async function reviewUseCaseSuggestion(
  formData: FormData,
): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const decision = str(formData, "decision"); // approve | dismiss
  if (!use_case_id) return;

  if (decision === "approve") {
    // Fold the suggestion into the objective (participant-approved).
    const { data } = await db()
      .from("use_cases")
      .select("ai_suggestion, objective")
      .eq("id", use_case_id)
      .single();
    const suggestion = (data?.ai_suggestion ?? "").toString();
    const objective = (data?.objective ?? "").toString();
    await db()
      .from("use_cases")
      .update({
        objective: objective ? `${objective}\n\n${suggestion}` : suggestion,
        ai_suggestion_review_status: "approved",
      })
      .eq("id", use_case_id);
  } else {
    await db()
      .from("use_cases")
      .update({ ai_suggestion_review_status: "dismissed" })
      .eq("id", use_case_id);
  }
  await logAudit({
    action: `ai.use_case_suggestion.${decision}`,
    objectType: "use_case",
    objectId: use_case_id,
  });
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

// ── Step 3: Prompts ─────────────────────────────────────────────────────────

export async function createPrompt(formData: FormData): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const participant_id = str(formData, "participant_id");
  const prompt_text = str(formData, "prompt_text");
  if (!use_case_id || !prompt_text) return;

  // next version number
  const existing = await db()
    .from("prompts")
    .select("version")
    .eq("use_case_id", use_case_id)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion =
    ((existing.data?.[0]?.version as number | undefined) ?? 0) + 1;

  const rating = numOrNull(formData, "rating");
  const { data, error } = await withRetry(() =>
    db()
      .from("prompts")
      .insert({
        use_case_id,
        participant_id,
        version: nextVersion,
        prompt_text,
        notes: str(formData, "notes") || null,
        rating: rating != null ? Math.round(rating) : null,
        status: "draft",
      })
      .select("id")
      .single(),
  );
  if (error || !data) throw error ?? new Error("insert failed");

  await logAudit({
    action: "prompt.create",
    objectType: "prompt",
    objectId: data.id,
    detail: { version: nextVersion, rating },
  });
  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

export async function ratePrompt(formData: FormData): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const id = str(formData, "id");
  const rating = numOrNull(formData, "rating");
  if (!id) return;
  await db()
    .from("prompts")
    .update({ rating: rating != null ? Math.round(rating) : null })
    .eq("id", id);
  await logAudit({
    action: "prompt.rate",
    objectType: "prompt",
    objectId: id,
    detail: { rating },
  });
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

export async function setWinningPrompt(formData: FormData): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const id = str(formData, "id");
  if (!id || !use_case_id) return;
  // demote others, promote this one
  await db()
    .from("prompts")
    .update({ status: "testing" })
    .eq("use_case_id", use_case_id)
    .eq("status", "winning");
  await db().from("prompts").update({ status: "winning" }).eq("id", id);
  await logAudit({
    action: "prompt.set_winning",
    objectType: "prompt",
    objectId: id,
  });
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

export async function improvePrompt(formData: FormData): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const participant_id = str(formData, "participant_id");
  const prompt_text = str(formData, "prompt_text");
  const experiment_notes = str(formData, "experiment_notes");
  if (!use_case_id || !prompt_text) return;

  const s = suggestPromptImprovement(prompt_text, experiment_notes);
  // Store as a new draft version so nothing is lost; mark AI provenance.
  const existing = await db()
    .from("prompts")
    .select("version")
    .eq("use_case_id", use_case_id)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion =
    ((existing.data?.[0]?.version as number | undefined) ?? 0) + 1;

  const { data, error } = await db()
    .from("prompts")
    .insert({
      use_case_id,
      participant_id,
      version: nextVersion,
      prompt_text: s.value,
      notes: "AI-suggested improvement (review before use)",
      status: "draft",
      ai_improvement_suggestion: s.value,
      ai_improvement_source: s.source,
      ai_improvement_confidence: s.confidence,
      ai_improvement_review_status: "unreviewed",
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("insert failed");

  await logAudit({
    action: "ai.suggest_prompt_improvement",
    objectType: "prompt",
    objectId: data.id,
    detail: { source: s.source, confidence: s.confidence },
  });
  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

// ── Step 4: Experiment ──────────────────────────────────────────────────────

export async function createExperiment(formData: FormData): Promise<void> {
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const participant_id = str(formData, "participant_id");
  if (!use_case_id) return;

  const { data, error } = await withRetry(() =>
    db()
      .from("experiments")
      .insert({
        use_case_id,
        participant_id,
        prompt_id: str(formData, "prompt_id") || null,
        run_date: str(formData, "run_date") || null,
        what_worked: str(formData, "what_worked") || null,
        what_failed: str(formData, "what_failed") || null,
        output_quality: str(formData, "output_quality") || null,
        iteration_notes: str(formData, "iteration_notes") || null,
        status: str(formData, "status") || "done",
      })
      .select("id")
      .single(),
  );
  if (error || !data) throw error ?? new Error("insert failed");

  await logAudit({
    action: "experiment.create",
    objectType: "experiment",
    objectId: data.id,
  });
  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  redirect(`/problems/${work_problem_id}`);
}

// ── Step 5: Playbook ────────────────────────────────────────────────────────

export async function savePlaybook(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const work_problem_id = str(formData, "work_problem_id");
  const use_case_id = str(formData, "use_case_id");
  const participant_id = str(formData, "participant_id");
  const title = str(formData, "title");
  if (!use_case_id || !participant_id || !title) return;

  const payload = {
    use_case_id,
    participant_id,
    title,
    workflow_steps: str(formData, "workflow_steps") || null,
    winning_prompt_id: str(formData, "winning_prompt_id") || null,
    tools_used: str(formData, "tools_used") || null,
    lessons_learned: str(formData, "lessons_learned") || null,
  };

  let playbookId = id;
  if (id) {
    const { error } = await db().from("playbooks").update(payload).eq("id", id);
    if (error) throw error;
    await logAudit({
      action: "playbook.update",
      objectType: "playbook",
      objectId: id,
    });
  } else {
    const { data, error } = await withRetry(() =>
      db()
        .from("playbooks")
        .insert({ ...payload, status: "active" })
        .select("id")
        .single(),
    );
    if (error || !data) throw error ?? new Error("insert failed");
    playbookId = data.id;
    await logAudit({
      action: "playbook.create",
      objectType: "playbook",
      objectId: data.id,
      detail: { title },
    });
  }

  // Mark chosen winning prompt
  const winning = str(formData, "winning_prompt_id");
  if (winning) {
    await db()
      .from("prompts")
      .update({ status: "testing" })
      .eq("use_case_id", use_case_id)
      .eq("status", "winning");
    await db().from("prompts").update({ status: "winning" }).eq("id", winning);
  }

  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  revalidatePath("/playbooks");
  redirect(`/problems/${work_problem_id}`);
}

// ── Step 6: Outcome ─────────────────────────────────────────────────────────

export async function recordOutcome(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const work_problem_id = str(formData, "work_problem_id");
  const playbook_id = str(formData, "playbook_id");
  const participant_id = str(formData, "participant_id");
  if (!playbook_id || !participant_id) return;

  const fields = {
    time_saved_per_week_hours: numOrNull(formData, "time_saved_per_week_hours"),
    quality_improvement: str(formData, "quality_improvement") || null,
    business_result: str(formData, "business_result") || null,
    confidence_level: str(formData, "confidence_level") || null,
    measurement_method: str(formData, "measurement_method") || null,
  };

  // Low-risk auto AI summary from the recorded metrics.
  const summary = summariseOutcome(fields);

  const payload = {
    playbook_id,
    participant_id,
    ...fields,
    ai_summary: summary.value,
    ai_summary_source: summary.source,
    ai_summary_confidence: summary.confidence,
    ai_summary_review_status: "auto",
  };

  let outcomeId = id;
  if (id) {
    const { error } = await db().from("outcomes").update(payload).eq("id", id);
    if (error) throw error;
    await logAudit({
      action: "outcome.update",
      objectType: "outcome",
      objectId: id,
    });
  } else {
    const { data, error } = await withRetry(() =>
      db().from("outcomes").insert(payload).select("id").single(),
    );
    if (error || !data) throw error ?? new Error("insert failed");
    outcomeId = data.id;
    await logAudit({
      action: "outcome.create",
      objectType: "outcome",
      objectId: data.id,
      detail: fields,
    });
  }

  await syncProblemStatus(work_problem_id);
  revalidatePath(`/problems/${work_problem_id}`);
  revalidatePath("/playbooks");
  revalidatePath("/admin");
  redirect(`/problems/${work_problem_id}?done=1`);
}

export async function verifyOutcome(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const verified = str(formData, "verified") === "true";
  const back = str(formData, "back") || "/manager";
  if (!id) return;
  await db()
    .from("outcomes")
    .update({ verified_by_manager: verified })
    .eq("id", id);
  await logAudit({
    action: verified ? "outcome.verify" : "outcome.unverify",
    objectType: "outcome",
    objectId: id,
  });
  revalidatePath(back);
  revalidatePath("/admin");
  redirect(back);
}

// Coaching notes live in audit_logs (no schema change needed): the latest
// "participant.coaching_note" row for a participant is the current note.
export async function saveCoachingNote(formData: FormData): Promise<void> {
  const participant_id = str(formData, "participant_id");
  const actor_email = str(formData, "actor_email") || null;
  const note = str(formData, "coaching_notes");
  const back = str(formData, "back") || "/admin";
  if (!participant_id) return;
  await db().from("audit_logs").insert({
    actor_email,
    action: "participant.coaching_note",
    object_type: "participant",
    object_id: participant_id,
    detail: { note },
  });
  revalidatePath(back);
  redirect(back);
}
