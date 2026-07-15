// Domain types mirroring supabase/migrations/0001_init.sql

export type WorkProblemStatus =
  | "identified"
  | "in_progress"
  | "use_case_defined"
  | "playbook_saved"
  | "completed";

export type UseCaseStatus = "draft" | "experimenting" | "completed";
export type PromptStatus = "draft" | "testing" | "winning";
export type ExperimentStatus = "in_progress" | "done";
export type PlaybookStatus = "active" | "archived";

export type Participant = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  job_title: string | null;
  department: string | null;
  manager_email: string | null;
  cohort: string | null;
  created_at: string;
};

export type WorkProblem = {
  id: string;
  user_id: string | null;
  participant_id: string;
  title: string;
  description: string | null;
  current_process: string | null;
  frequency: string | null;
  estimated_time_per_week_hours: number | null;
  status: WorkProblemStatus;
  created_at: string;
};

export type UseCase = {
  id: string;
  user_id: string | null;
  work_problem_id: string;
  participant_id: string;
  title: string;
  ai_tool: string | null;
  objective: string | null;
  expected_benefit: string | null;
  status: UseCaseStatus;
  ai_suggestion: string | null;
  ai_suggestion_source: string | null;
  ai_suggestion_confidence: number | null;
  ai_suggestion_review_status: string | null;
  created_at: string;
};

export type Prompt = {
  id: string;
  user_id: string | null;
  use_case_id: string;
  participant_id: string;
  version: number;
  prompt_text: string;
  notes: string | null;
  rating: number | null;
  status: PromptStatus;
  ai_improvement_suggestion: string | null;
  ai_improvement_source: string | null;
  ai_improvement_confidence: number | null;
  ai_improvement_review_status: string | null;
  created_at: string;
};

export type Experiment = {
  id: string;
  user_id: string | null;
  use_case_id: string;
  participant_id: string;
  prompt_id: string | null;
  run_date: string | null;
  what_worked: string | null;
  what_failed: string | null;
  output_quality: string | null;
  iteration_notes: string | null;
  status: ExperimentStatus;
  created_at: string;
};

export type Playbook = {
  id: string;
  user_id: string | null;
  use_case_id: string;
  participant_id: string;
  title: string;
  workflow_steps: string | null;
  winning_prompt_id: string | null;
  tools_used: string | null;
  lessons_learned: string | null;
  status: PlaybookStatus;
  created_at: string;
};

export type Outcome = {
  id: string;
  user_id: string | null;
  playbook_id: string;
  participant_id: string;
  time_saved_per_week_hours: number | null;
  quality_improvement: string | null;
  business_result: string | null;
  confidence_level: string | null;
  measurement_method: string | null;
  verified_by_manager: boolean;
  ai_summary: string | null;
  ai_summary_source: string | null;
  ai_summary_confidence: number | null;
  ai_summary_review_status: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  actor_email: string | null;
  action: string;
  object_type: string | null;
  object_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

// The 6 guided steps. Step 1 is the work problem itself.
export const STEPS = [
  { n: 1, key: "problem", label: "Work Problem", verb: "Describe the problem" },
  { n: 2, key: "use_case", label: "AI Use Case", verb: "Define the use case" },
  { n: 3, key: "prompts", label: "Prompts", verb: "Draft & rate prompts" },
  { n: 4, key: "experiment", label: "Experiment", verb: "Log what worked" },
  { n: 5, key: "playbook", label: "Playbook", verb: "Save the playbook" },
  { n: 6, key: "outcome", label: "Outcome", verb: "Record the result" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

// Aggregated progress for a single work problem across all 6 steps.
export type WorkflowProgress = {
  problem: WorkProblem;
  useCase: UseCase | null;
  prompts: Prompt[];
  experiments: Experiment[];
  playbook: Playbook | null;
  outcome: Outcome | null;
  // highest step with data (1..6)
  completedThrough: number;
  // next step the user should work on (1..6), capped at 6
  currentStep: number;
};
