# Data Model

## participants
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | set at auth lock-down |
| full_name | text | |
| email | text | |
| job_title | text | |
| department | text | |
| manager_email | text | |
| cohort | text | training program name |
| created_at | timestamptz | |

## work_problems
`id, user_id, participant_id→participants, title, description, current_process, frequency, estimated_time_per_week_hours, status` [identified → in_progress → use_case_defined → completed]

## use_cases
`id, user_id, participant_id, work_problem_id→work_problems, title, ai_tool, objective, expected_benefit, status` [draft → experimenting → completed]\
**AI fields:** `ai_suggestion, ai_suggestion_source, ai_suggestion_confidence, ai_suggestion_review_status`

## prompts
`id, user_id, participant_id, use_case_id→use_cases, version(int), prompt_text, notes, rating(1-5), status` [draft → testing → winning]\
**AI fields:** `ai_improvement_suggestion, ai_improvement_source, ai_improvement_confidence, ai_improvement_review_status`

## experiments
`id, user_id, participant_id, use_case_id, prompt_id→prompts, run_date, what_worked, what_failed, output_quality, iteration_notes, status` [in_progress → done]

## playbooks
`id, user_id, participant_id, use_case_id→use_cases, title, workflow_steps(text), winning_prompt_id→prompts, tools_used, lessons_learned, status` [active | archived]

## outcomes
`id, user_id, participant_id, playbook_id→playbooks, time_saved_per_week_hours, quality_improvement, business_result, confidence_level, measurement_method, verified_by_manager(bool)`\
**AI fields:** `ai_summary, ai_summary_source, ai_summary_confidence, ai_summary_review_status`

## audit_logs
`id, user_id, actor_email, action, object_type, object_id, detail(jsonb), created_at`

## RLS
- All tables: open read + write policies in v1 (demo-first)
- Lock-down sprint replaces with `auth.uid() = user_id` owner policies
- `/admin` route enforced at app layer by checking `auth.users.email` against trainer email env var
