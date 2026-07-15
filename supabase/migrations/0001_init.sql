create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  full_name text,
  role text default 'participant',
  cohort text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "profiles_v1_read" on profiles;
create policy "profiles_v1_read" on profiles for select using (true);
drop policy if exists "profiles_v1_write" on profiles;
create policy "profiles_v1_write" on profiles for all using (true) with check (true);

create table if not exists work_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  description text,
  category text,
  frequency text,
  status text default 'draft',
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
  work_problem_id uuid,
  title text,
  current_process text,
  goal text,
  ai_fit_score numeric,
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
  use_case_id uuid,
  version int default 1,
  prompt_text text,
  notes text,
  ai_improved_text text,
  ai_improved_source text,
  ai_improved_confidence numeric,
  ai_improved_review_status text default 'unreviewed',
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
  prompt_id uuid,
  result_description text,
  rating int,
  what_worked text,
  what_failed text,
  status text default 'running',
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
  experiment_id uuid,
  title text,
  steps jsonb,
  prompt_snapshot text,
  reuse_count int default 0,
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
  playbook_id uuid,
  time_saved_hours numeric,
  quality_improvement text,
  business_impact text,
  evidence text,
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
  action text,
  table_name text,
  record_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into profiles (id, full_name, email, role, cohort) values
  ('a1000000-0000-0000-0000-000000000001', 'Sarah Chen', 'sarah.chen@demo.com', 'participant', 'March 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000002', 'Marcus Webb', 'marcus.webb@demo.com', 'participant', 'March 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000003', 'Priya Nair', 'priya.nair@demo.com', 'manager', 'March 2025 AI Cohort'),
  ('a1000000-0000-0000-0000-000000000004', 'James Okafor', 'james.okafor@demo.com', 'participant', 'March 2025 AI Cohort');

insert into work_problems (id, user_id, title, description, category, frequency, status) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Weekly client status reports', 'I spend 2 hours every Friday summarising project updates from emails and Slack into a client report.', 'drafting', 'weekly', 'resolved'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Meeting notes to action items', 'After every team meeting I manually convert raw notes into structured action items. Takes 45 min.', 'repetitive', 'daily', 'active'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Supplier quote comparison', 'Comparing 5–10 supplier quotes in spreadsheets takes 3 hours and I still miss things.', 'data', 'monthly', 'draft');

insert into use_cases (id, user_id, work_problem_id, title, current_process, goal, ai_fit_score, ai_suggestion, ai_suggestion_source, ai_suggestion_confidence, ai_suggestion_review_status) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'AI-assisted client status report', 'Copy-paste from emails, rewrite in Word, review, send.', 'Reduce report writing from 2 hours to 20 minutes', 0.91, 'Use a structured prompt to summarise bullet inputs into a professional client update.', 'gpt-4o', 0.91, 'accepted'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Meeting notes action item extractor', 'Read through notes, identify owners and deadlines manually.', 'Extract and format action items in under 5 minutes', 0.87, 'Paste raw notes into a prompt that returns a structured action item list with owner and due date.', 'gpt-4o', 0.87, 'accepted');

insert into prompts (id, user_id, use_case_id, version, prompt_text, notes, ai_improved_text, ai_improved_source, ai_improved_confidence, ai_improved_review_status) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 2, 'You are a professional client communications writer. Given the following bullet-point project updates, write a concise client status report in three sections: Progress, Risks, Next Steps. Tone: clear, confident, under 250 words.', 'v2 — added tone and word limit, much better output', 'Consider adding a section for key decisions made this week to increase client trust.', 'gpt-4o', 0.78, 'unreviewed'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 1, 'Extract all action items from the meeting notes below. For each item return: Action, Owner, Due Date, Priority (High/Medium/Low). Format as a markdown table.', 'First attempt — works well', null, null, null, 'unreviewed');

insert into experiments (id, user_id, prompt_id, result_description, rating, what_worked, what_failed, status) values
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Generated a clean 200-word report in 3 minutes. Client responded positively.', 5, 'Three-section structure, tone instruction, word limit', 'First version missed the risks section — fixed in v2', 'success'),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'Extracted 8 action items from 40-minute meeting notes in 4 minutes.', 4, 'Markdown table format, priority column', 'Occasionally misses implicit owners — need to name people explicitly in notes', 'success');

insert into playbooks (id, user_id, experiment_id, title, steps, prompt_snapshot) values
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Weekly Client Status Report Playbook', '["1. Collect bullet updates from email and Slack","2. Paste into prompt with project name and date","3. Review AI draft — check risks section","4. Send to client"]', 'You are a professional client communications writer. Given the following bullet-point project updates, write a concise client status report in three sections: Progress, Risks, Next Steps. Tone: clear, confident, under 250 words.'),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'Meeting Action Item Extractor Playbook', '["1. Paste raw meeting notes into prompt","2. Review markdown table output","3. Assign any unnamed owners","4. Copy to project tracker"]', 'Extract all action items from the meeting notes below. For each item return: Action, Owner, Due Date, Priority (High/Medium/Low). Format as a markdown table.');

insert into outcomes (id, user_id, playbook_id, time_saved_hours, quality_improvement, business_impact, evidence, ai_summary, ai_summary_source, ai_summary_confidence, ai_summary_review_status) values
  ('g1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 1.67, 'Reports are more consistent and professionally worded. Client satisfaction improved.', 'Saved approximately 87 hours annually on client reporting. Client renewed contract.', 'Client email praising report quality; time log showing drop from 2h to 20min', 'Sarah reduced weekly client report time by 83%, saving ~87 hours per year, while improving consistency and client satisfaction.', 'gpt-4o', 0.88, 'accepted'),
  ('g1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 0.67, 'Action items are clearer and no longer missed after meetings.', 'Team delivery improved — fewer missed actions week-on-week.', 'Compared action item completion rate before and after (62% → 89%)', 'Marcus cut post-meeting admin from 45 to 5 minutes, and team action completion rose from 62% to 89%.', 'gpt-4o', 0.85, 'accepted');