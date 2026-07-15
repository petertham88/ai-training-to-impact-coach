import { db, withRetry } from "@/lib/supabase/data";
import type {
  Participant,
  WorkProblem,
  UseCase,
  Prompt,
  Experiment,
  Playbook,
  Outcome,
  AuditLog,
  WorkflowProgress,
} from "@/lib/types";

// ── Participants ────────────────────────────────────────────────────────────

export async function getParticipants(): Promise<Participant[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Participant[];
  });
}

export async function getParticipant(id: string): Promise<Participant | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("participants")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as Participant) ?? null;
  });
}

// ── Work problems ───────────────────────────────────────────────────────────

export async function getWorkProblems(
  participantId: string,
): Promise<WorkProblem[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("work_problems")
      .select("*")
      .eq("participant_id", participantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as WorkProblem[];
  });
}

export async function getWorkProblem(id: string): Promise<WorkProblem | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("work_problems")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as WorkProblem) ?? null;
  });
}

// ── Use cases / prompts / experiments / playbooks / outcomes ────────────────

export async function getUseCaseForProblem(
  workProblemId: string,
): Promise<UseCase | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("use_cases")
      .select("*")
      .eq("work_problem_id", workProblemId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as UseCase) ?? null;
  });
}

export async function getUseCase(id: string): Promise<UseCase | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("use_cases")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as UseCase) ?? null;
  });
}

export async function getPrompts(useCaseId: string): Promise<Prompt[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("prompts")
      .select("*")
      .eq("use_case_id", useCaseId)
      .order("version", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Prompt[];
  });
}

export async function getExperiments(useCaseId: string): Promise<Experiment[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("experiments")
      .select("*")
      .eq("use_case_id", useCaseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Experiment[];
  });
}

export async function getPlaybookForUseCase(
  useCaseId: string,
): Promise<Playbook | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("playbooks")
      .select("*")
      .eq("use_case_id", useCaseId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as Playbook) ?? null;
  });
}

export async function getPlaybook(id: string): Promise<Playbook | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("playbooks")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as Playbook) ?? null;
  });
}

export async function getOutcomeForPlaybook(
  playbookId: string,
): Promise<Outcome | null> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("outcomes")
      .select("*")
      .eq("playbook_id", playbookId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as Outcome) ?? null;
  });
}

// ── Aggregated workflow progress for one work problem ───────────────────────

export async function getWorkflowProgress(
  workProblemId: string,
): Promise<WorkflowProgress | null> {
  const problem = await getWorkProblem(workProblemId);
  if (!problem) return null;

  const useCase = await getUseCaseForProblem(workProblemId);
  let prompts: Prompt[] = [];
  let experiments: Experiment[] = [];
  let playbook: Playbook | null = null;
  let outcome: Outcome | null = null;

  if (useCase) {
    [prompts, experiments, playbook] = await Promise.all([
      getPrompts(useCase.id),
      getExperiments(useCase.id),
      getPlaybookForUseCase(useCase.id),
    ]);
    if (playbook) outcome = await getOutcomeForPlaybook(playbook.id);
  }

  let completedThrough = 1; // the problem always exists = step 1 done
  if (useCase) completedThrough = 2;
  if (prompts.length > 0) completedThrough = 3;
  if (experiments.length > 0) completedThrough = 4;
  if (playbook) completedThrough = 5;
  if (outcome) completedThrough = 6;

  const currentStep = Math.min(completedThrough + 1, 6);

  return {
    problem,
    useCase,
    prompts,
    experiments,
    playbook,
    outcome,
    completedThrough,
    currentStep,
  };
}

// Lightweight progress used for dashboard lists (avoids over-fetching).
export async function getProblemStepCounts(workProblemId: string): Promise<{
  completedThrough: number;
}> {
  const progress = await getWorkflowProgress(workProblemId);
  return { completedThrough: progress?.completedThrough ?? 1 };
}

// ── Playbook library (across a participant) ─────────────────────────────────

export async function getPlaybooksForParticipant(
  participantId: string,
): Promise<Playbook[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("playbooks")
      .select("*")
      .eq("participant_id", participantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Playbook[];
  });
}

export async function getAllPlaybooks(): Promise<Playbook[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("playbooks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Playbook[];
  });
}

export type PlaybookDetail = {
  playbook: Playbook;
  useCase: UseCase | null;
  winningPrompt: Prompt | null;
  outcome: Outcome | null;
  participant: Participant | null;
};

export async function getPlaybookDetail(
  id: string,
): Promise<PlaybookDetail | null> {
  const playbook = await getPlaybook(id);
  if (!playbook) return null;
  const [useCase, outcome, participant] = await Promise.all([
    getUseCase(playbook.use_case_id),
    getOutcomeForPlaybook(playbook.id),
    getParticipant(playbook.participant_id),
  ]);
  let winningPrompt: Prompt | null = null;
  if (playbook.winning_prompt_id) {
    winningPrompt = await withRetry(async () => {
      const { data, error } = await db()
        .from("prompts")
        .select("*")
        .eq("id", playbook.winning_prompt_id)
        .maybeSingle();
      if (error) throw error;
      return (data as Prompt) ?? null;
    });
  }
  return { playbook, useCase, winningPrompt, outcome, participant };
}

// ── Audit log ───────────────────────────────────────────────────────────────

export async function getRecentAuditLogs(limit = 50): Promise<AuditLog[]> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as AuditLog[];
  });
}

// ── Aggregated overview (admin / manager) ──────────────────────────────────

export type ParticipantRollup = {
  participant: Participant;
  problemCount: number;
  completedCount: number; // workflows through step 6
  currentStep: number; // furthest step reached across their workflows
  playbookCount: number;
  hoursSaved: number;
  lastActivity: string | null; // ISO
  stuck: boolean; // 7+ days inactive and no completed workflow
  coachingNote: string;
};

export type UseCaseRow = {
  useCase: UseCase;
  participantName: string;
  hoursSaved: number;
};

export type Overview = {
  totals: {
    participants: number;
    activeWorkflows: number;
    completedPlaybooks: number;
    hoursSaved: number;
  };
  rollups: ParticipantRollup[];
  useCaseRows: UseCaseRow[];
};

async function all<T>(table: string): Promise<T[]> {
  return withRetry(async () => {
    const { data, error } = await db().from(table).select("*");
    if (error) throw error;
    return (data ?? []) as T[];
  });
}

export async function getOverview(): Promise<Overview> {
  const [
    participants,
    problems,
    useCases,
    playbooks,
    outcomes,
    experiments,
    prompts,
    notes,
  ] = await Promise.all([
    all<Participant>("participants"),
    all<WorkProblem>("work_problems"),
    all<UseCase>("use_cases"),
    all<Playbook>("playbooks"),
    all<Outcome>("outcomes"),
    all<Experiment>("experiments"),
    all<Prompt>("prompts"),
    withRetry(async () => {
      const { data, error } = await db()
        .from("audit_logs")
        .select("object_id, detail, created_at")
        .eq("action", "participant.coaching_note")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as {
        object_id: string;
        detail: { note?: string } | null;
        created_at: string;
      }[];
    }),
  ]);

  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  const outcomeByPlaybook = new Map(outcomes.map((o) => [o.playbook_id, o]));
  const noteByParticipant = new Map<string, string>();
  for (const n of notes) {
    if (!noteByParticipant.has(n.object_id))
      noteByParticipant.set(n.object_id, n.detail?.note ?? "");
  }

  // completedThrough per work problem
  function stepFor(problemId: string): number {
    const ucs = useCases.filter((u) => u.work_problem_id === problemId);
    if (ucs.length === 0) return 1;
    const ucIds = ucs.map((u) => u.id);
    const hasPrompt = prompts.some((p) => ucIds.includes(p.use_case_id));
    const hasExp = experiments.some((e) => ucIds.includes(e.use_case_id));
    const pbs = playbooks.filter((p) => ucIds.includes(p.use_case_id));
    const hasPlaybook = pbs.length > 0;
    const hasOutcome = pbs.some((p) => outcomeByPlaybook.has(p.id));
    let s = 2;
    if (hasPrompt) s = 3;
    if (hasExp) s = 4;
    if (hasPlaybook) s = 5;
    if (hasOutcome) s = 6;
    return s;
  }

  const rollups: ParticipantRollup[] = participants.map((participant) => {
    const myProblems = problems.filter(
      (p) => p.participant_id === participant.id,
    );
    const steps = myProblems.map((p) => stepFor(p.id));
    const currentStep = steps.length ? Math.max(...steps) : 0;
    const completedCount = steps.filter((s) => s >= 6).length;
    const myPlaybooks = playbooks.filter(
      (p) => p.participant_id === participant.id,
    );
    const myOutcomes = outcomes.filter(
      (o) => o.participant_id === participant.id,
    );
    const hoursSaved = myOutcomes.reduce(
      (sum, o) => sum + (o.time_saved_per_week_hours ?? 0),
      0,
    );

    const activityDates = [
      participant.created_at,
      ...myProblems.map((p) => p.created_at),
      ...myPlaybooks.map((p) => p.created_at),
      ...myOutcomes.map((o) => o.created_at),
    ]
      .filter(Boolean)
      .map((d) => new Date(d).getTime());
    const lastMs = activityDates.length ? Math.max(...activityDates) : null;
    const incomplete = myProblems.length > 0 && completedCount === 0;
    const stuck =
      incomplete && lastMs != null && now - lastMs > WEEK;

    return {
      participant,
      problemCount: myProblems.length,
      completedCount,
      currentStep,
      playbookCount: myPlaybooks.length,
      hoursSaved,
      lastActivity: lastMs ? new Date(lastMs).toISOString() : null,
      stuck,
      coachingNote: noteByParticipant.get(participant.id) ?? "",
    };
  });

  const nameById = new Map(participants.map((p) => [p.id, p.full_name]));
  const useCaseRows: UseCaseRow[] = useCases.map((uc) => {
    const pbs = playbooks.filter((p) => p.use_case_id === uc.id);
    const hours = pbs.reduce(
      (sum, p) => sum + (outcomeByPlaybook.get(p.id)?.time_saved_per_week_hours ?? 0),
      0,
    );
    return {
      useCase: uc,
      participantName: nameById.get(uc.participant_id) ?? "—",
      hoursSaved: hours,
    };
  });

  const activeWorkflows = rollups.reduce(
    (n, r) => n + Math.max(r.problemCount - r.completedCount, 0),
    0,
  );

  return {
    totals: {
      participants: participants.length,
      activeWorkflows,
      completedPlaybooks: rollups.reduce((n, r) => n + r.completedCount, 0),
      hoursSaved: outcomes.reduce(
        (sum, o) => sum + (o.time_saved_per_week_hours ?? 0),
        0,
      ),
    },
    rollups: rollups.sort((a, b) => b.currentStep - a.currentStep),
    useCaseRows: useCaseRows.sort((a, b) => b.hoursSaved - a.hoursSaved),
  };
}

// Outcomes enriched with participant + playbook context (manager/HR + export).
export type OutcomeRow = {
  outcome: Outcome;
  participant: Participant | null;
  playbookTitle: string;
};

export async function getOutcomeRows(): Promise<OutcomeRow[]> {
  const [outcomes, participants, playbooks] = await Promise.all([
    all<Outcome>("outcomes"),
    all<Participant>("participants"),
    all<Playbook>("playbooks"),
  ]);
  const pById = new Map(participants.map((p) => [p.id, p]));
  const pbById = new Map(playbooks.map((p) => [p.id, p]));
  return outcomes
    .map((outcome) => ({
      outcome,
      participant: pById.get(outcome.participant_id) ?? null,
      playbookTitle: pbById.get(outcome.playbook_id)?.title ?? "—",
    }))
    .sort(
      (a, b) =>
        (b.outcome.time_saved_per_week_hours ?? 0) -
        (a.outcome.time_saved_per_week_hours ?? 0),
    );
}

// Latest trainer coaching note for a participant (stored in audit_logs).
export async function getCoachingNote(
  participantId: string,
): Promise<string> {
  return withRetry(async () => {
    const { data, error } = await db()
      .from("audit_logs")
      .select("detail")
      .eq("action", "participant.coaching_note")
      .eq("object_id", participantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    const detail = (data?.detail ?? {}) as { note?: string };
    return detail.note ?? "";
  });
}
