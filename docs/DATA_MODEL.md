# Data Model

## users *(managed by Supabase Auth + this profile table)*
`id uuid PK` · `email text` · `full_name text` · `role text` (participant/manager/admin) · `cohort text` · `user_id uuid nullable` · `created_at timestamptz`

## work_problems
`id uuid PK` · `user_id uuid nullable` · `title text` · `description text` · `category text` · `frequency text` · `status text` (draft/active/resolved) · `created_at timestamptz`

## use_cases
`id uuid PK` · `user_id uuid nullable` · `work_problem_id uuid FK` · `title text` · `current_process text` · `goal text` · `ai_suggestion text` · `ai_suggestion_source text` · `ai_suggestion_confidence numeric` · `ai_suggestion_review_status text default 'unreviewed'` · `created_at timestamptz`

## prompts
`id uuid PK` · `user_id uuid nullable` · `use_case_id uuid FK` · `version int` · `prompt_text text` · `notes text` · `ai_improved_text text` · `ai_improved_source text` · `ai_improved_confidence numeric` · `ai_improved_review_status text default 'unreviewed'` · `created_at timestamptz`

## experiments
`id uuid PK` · `user_id uuid nullable` · `prompt_id uuid FK` · `result_description text` · `rating int` (1-5) · `what_worked text` · `what_failed text` · `status text` (running/success/failed) · `created_at timestamptz`

## playbooks
`id uuid PK` · `user_id uuid nullable` · `experiment_id uuid FK` · `title text` · `steps jsonb` · `prompt_snapshot text` · `reuse_count int default 0` · `created_at timestamptz`

## outcomes
`id uuid PK` · `user_id uuid nullable` · `playbook_id uuid FK` · `time_saved_hours numeric` · `quality_improvement text` · `business_impact text` · `evidence text` · `ai_summary text` · `ai_summary_source text` · `ai_summary_confidence numeric` · `ai_summary_review_status text default 'unreviewed'` · `created_at timestamptz`

## RLS
All tables: v1 permissive read+write. Lock-down sprint replaces with `auth.uid() = user_id`.
