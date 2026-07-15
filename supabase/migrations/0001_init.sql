create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  email text not null,
  job_title text,
  department text,
  manager_email text,
  cohort text,
  created_at timestamptz not null default now()
);
alter table participants enable row level security;
drop policy if exists "participants_v1_read" on participants;
create policy "participants_v1_read" on participants for select using (true);
drop policy if exists "participants_v1_write" on participants;
create policy "participants_v1_write" on participants for all using (true) with check (true);

create table if not exists work_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  participant_id uuid references participants(id),
  title text not null,
  description text,
  current_process text,
  frequency text,
  estimated_time_per_week_hours numeric,
  status text not null default 'identified',
  created_at timestamptz not null default now()
);
alter table work_problems enable row level security;
drop policy if exists "work_problems_v1_read" on work_problems;
create policy "work_problems_v1_read" on work_problems for select using (true);
drop policy if exists "work_problems_v1_write" on work_problems;
create policy "work_problems_v1_write" on work_problems for all using (true) with check (true);

create table if not exists use_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  work_problem_id uuid references work_problems(id),
  participant_id uuid references participants(id),
  title text not null,
  ai_tool text,
  objective text,
  expected_benefit text,
  status text not null default 'draft',
  ai_suggestion text,
  ai_suggestion_source text,
  ai_suggestion_confidence numeric,
  ai_suggestion_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table use_cases enable row level security;
drop policy if exists "use_cases_v1_read" on use_cases;
create policy "use_cases_v1_read" on use_cases for select using (true);
drop policy if exists "use_cases_v1_write" on use_cases;
create policy "use_cases_v1_write" on use_cases for all using (true) with check (true);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  use_case_id uuid references use_cases(id),
  participant_id uuid references participants(id),
  version integer not null default 1,
  prompt_text text not null,
  notes text,
  rating integer,
  status text not null default 'draft',
  ai_improvement_suggestion text,
  ai_improvement_source text,
  ai_improvement_confidence numeric,
  ai_improvement_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table prompts enable row level security;
drop policy if exists "prompts_v1_read" on prompts;
create policy "prompts_v1_read" on prompts for select using (true);
drop policy if exists "prompts_v1_write" on prompts;
create policy "prompts_v1_write" on prompts for all using (true) with check (true);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  use_case_id uuid references use_cases(id),
  participant_id uuid references participants(id),
  prompt_id uuid references prompts(id),
  run_date date,
  what_worked text,
  what_failed text,
  output_quality text,
  iteration_notes text,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);
alter table experiments enable row level security;
drop policy if exists "experiments_v1_read" on experiments;
create policy "experiments_v1_read" on experiments for select using (true);
drop policy if exists "experiments_v1_write" on experiments;
create policy "experiments_v1_write" on experiments for all using (true) with check (true);

create table if not exists playbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  use_case_id uuid references use_cases(id),
  participant_id uuid references participants(id),
  title text not null,
  workflow_steps text,
  winning_prompt_id uuid references prompts(id),
  tools_used text,
  lessons_learned text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
alter table playbooks enable row level security;
drop policy if exists "playbooks_v1_read" on playbooks;
create policy "playbooks_v1_read" on playbooks for select using (true);
drop policy if exists "playbooks_v1_write" on playbooks;
create policy "playbooks_v1_write" on playbooks for all using (true) with check (true);

create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  playbook_id uuid references playbooks(id),
  participant_id uuid references participants(id),
  time_saved_per_week_hours numeric,
  quality_improvement text,
  business_result text,
  confidence_level text,
  measurement_method text,
  verified_by_manager boolean default false,
  ai_summary text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table outcomes enable row level security;
drop policy if exists "outcomes_v1_read" on outcomes;
create policy "outcomes_v1_read" on outcomes for select using (true);
drop policy if exists "outcomes_v1_write" on outcomes;
create policy "outcomes_v1_write" on outcomes for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  actor_email text,
  action text not null,
  object_type text,
  object_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into participants (id, full_name, email, job_title, department, cohort) values
  ('a1000000-0000-0000-0000-000000000001', 'Sarah Mitchell', 'sarah.mitchell@demo.com', 'Operations Manager', 'Operations', 'April 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000002', 'James Okafor', 'james.okafor@demo.com', 'Senior Analyst', 'Finance', 'April 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000003', 'Priya Sharma', 'priya.sharma@demo.com', 'HR Business Partner', 'Human Resources', 'April 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000004', 'Tom Gallagher', 'tom.gallagher@demo.com', 'Sales Director', 'Sales', 'March 2025 AI Cohort');

insert into work_problems (id, participant_id, title, description, current_process, frequency, estimated_time_per_week_hours, status) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Weekly ops status report', 'Manually compiling data from 5 spreadsheets into a Word report', 'Copy-paste from each sheet, reformat, write narrative summary, email to 12 stakeholders', 'Weekly', 3, 'in_progress'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Monthly variance commentary', 'Writing explanations for every budget line that moved more than 5%', 'Pull actuals, compare to budget, write a sentence per line — roughly 40 lines', 'Monthly', 4, 'use_case_defined'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Job description drafting', 'Writing JDs from scratch for each new role, slow and inconsistent', 'Interview hiring manager, take notes, draft from blank document, iterate 3+ times', 'As needed', 2, 'playbook_saved'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Prospect follow-up emails', 'Crafting personalised follow-up emails after every sales call', 'Review call notes, write email, review, send — repeated for each prospect', 'Daily', 1.5, 'completed');

insert into use_cases (id, work_problem_id, participant_id, title, ai_tool, objective, expected_benefit, status) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'AI-drafted ops status report', 'ChatGPT', 'Paste raw data, get a formatted narrative report', 'Save 2.5 hrs/week, consistent format', 'experimenting'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Variance commentary generator', 'ChatGPT', 'Input variance table, generate plain-English commentary', 'Save 3 hrs/month, better first drafts', 'experimenting'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Job description generator', 'ChatGPT', 'Provide role brief, generate structured JD ready for review', 'Save 1.5 hrs per hire, consistent quality', 'completed'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Personalised follow-up email writer', 'ChatGPT', 'Paste call notes, generate tailored follow-up email', 'Save 45 min/day, higher response rate', 'completed');

insert into prompts (id, use_case_id, participant_id, version, prompt_text, rating, status) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 3, 'You are an HR specialist. Write a job description for the following role using this structure: [Role summary | Key responsibilities | Must-have skills | Nice-to-have skills | What success looks like in 90 days]. Role brief: {{role_brief}}', 5, 'winning'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 2, 'You are a sales professional. Write a short, warm follow-up email based on these call notes: {{call_notes}}. Tone: friendly and specific. End with one clear next step. No generic phrases.', 5, 'winning'),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, 'Summarise the following operational data into a weekly status report for senior stakeholders. Highlight risks, wins and actions needed. Data: {{data}}', 3, 'draft');

insert into playbooks (id, use_case_id, participant_id, title, workflow_steps, winning_prompt_id, tools_used, lessons_learned, status) values
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'JD Generator Playbook', '1. Interview hiring manager (15 min)\n2. Fill role brief template\n3. Paste brief into ChatGPT with winning prompt\n4. Review and edit output (10 min)\n5. Send to hiring manager for sign-off', 'd1000000-0000-0000-0000-000000000001', 'ChatGPT-4', 'Be specific about seniority level in the brief. Generic briefs give generic JDs. Always review before sending.', 'active'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Sales Follow-Up Email Playbook', '1. Take structured call notes during the call\n2. Immediately after call, paste notes into ChatGPT with winning prompt\n3. Read output, adjust tone if needed\n4. Send within 30 minutes of call', 'd1000000-0000-0000-0000-000000000002', 'ChatGPT-4', 'Better call notes = better emails. Added a simple notes template to capture name, pain points, next step agreed.', 'active');

insert into outcomes (id, playbook_id, participant_id, time_saved_per_week_hours, quality_improvement, business_result, confidence_level, measurement_method, verified_by_manager) values
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1.5, 'JDs are more consistent and require fewer revisions from hiring managers', 'Time-to-post reduced by 2 days per role. Hiring manager satisfaction up.', 'high', 'Tracked time before and after for 4 hires', true),
  ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 5.0, 'Emails are more personalised and specific — prospects comment on it', 'Reply rate increased from 22% to 38% over 3 weeks. One deal accelerated.', 'high', 'CRM reply tracking over 3 weeks vs prior 3 weeks', true);