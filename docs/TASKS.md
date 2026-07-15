# Tasks & Sprints

## Gantt Overview
```
Sprint 1: DB & seed          ██
Sprint 2: Core workflow      ████  ← v1 functional milestone
Sprint 3: Dashboards         ██
Sprint 4: Auth lock-down     ██
Sprint 5: Admin panel        ██
Sprint 6: Manager/HR views   ██
```

---

## Sprint 1 — Database & Demo Seed
**Goal:** All tables exist, seed data loads, app is queryable.
- [ ] Run migration SQL (all 8 tables)
- [ ] Confirm seed data visible in Supabase table editor
- [ ] Verify RLS open policies allow anonymous reads
- [ ] Confirm all foreign key references resolve

**Done when:** Supabase dashboard shows all tables with seed rows; a direct `select *` query returns data for every table.

---

## Sprint 2 — Core Guided Workflow ✦ v1 functional
**Goal:** One participant completes all 6 steps end-to-end; data persists.
- [ ] Step 1: "Describe your work problem" form → saves to `work_problems`
- [ ] Step 2: "Define your AI use case" form → saves to `use_cases`
- [ ] Step 3: Prompt builder with version history → saves to `prompts`
- [ ] Step 4: Log experiment (what worked / failed) → saves to `experiments`
- [ ] Step 5: Save playbook (workflow steps + winning prompt) → saves to `playbooks`
- [ ] Step 6: Record outcome (time saved + business result) → saves to `outcomes`
- [ ] Step progress indicator (visual, not cosmetic — reflects DB state)
- [ ] All 5 UI states handled per screen: loading, empty, partial, error, ready
- [ ] No dead buttons — every action writes to DB and UI reflects it

**Done when:** Demo participant (seeded) navigates all 6 steps, submits each form, refreshes page — all data persists and progress indicator matches DB state.

---

## Sprint 3 — Participant Dashboard & Playbook Library
**Goal:** Participant sees all their work in one place.
- [ ] `/dashboard` — list of work problems with status and step progress
- [ ] "Start new workflow" button creates a new `work_problem` and enters Step 1
- [ ] `/playbooks` — list of saved playbooks with outcome summary
- [ ] Playbook detail page: full steps, winning prompt, outcome metrics
- [ ] Empty state for new participants (no data yet)
- [ ] Edit and delete a work problem (with confirmation)

**Done when:** Dashboard shows seeded participant's problems; new problem can be created; playbook detail page loads with all fields.

---

## Sprint 4 — Auth Gateway (Lock It Down)
**Goal:** All participant data is owner-scoped; unauthenticated access blocked.
- [ ] Supabase Auth: email + password signup and login pages
- [ ] `/login` and `/signup` pages with error handling
- [ ] Middleware redirects unauthenticated users to `/login`
- [ ] Replace open RLS policies with `auth.uid() = user_id` on all tables
- [ ] `user_id` populated on all new writes after login
- [ ] Existing demo seed rows remain readable as public demo (or behind a demo login)
- [ ] Test: logged-in user cannot read another user's records

**Done when:** Two test accounts cannot see each other's data; unauthenticated request to `/dashboard` redirects to `/login`.

---

## Sprint 5 — Admin Panel
**Goal:** Trainer can see all adoption and progress data at `/admin`.
- [ ] `/admin` server-side check: `session.email === TRAINER_EMAIL` env var; else 403
- [ ] Summary tiles: total participants, active workflows, completed playbooks, total hours saved
- [ ] Participant table: name, cohort, current step, last active
- [ ] Use case list: title, participant, status, time saved
- [ ] Filter: "stuck" participants (no activity in 7+ days, workflow incomplete)
- [ ] Audit log view (last 50 actions)

**Done when:** Trainer email accesses `/admin` and sees all seeded data; non-trainer email gets 403.

---

## Sprint 6 — Manager / HR Dashboard & Reports
**Goal:** Managers see their team; HR exports results.
- [ ] Manager view: `/manager` — team member list with workflow stage and outcomes
- [ ] HR summary: cohort-level stats — started / completed / stalled counts
- [ ] Outcome verification: manager can mark an outcome as verified
- [ ] CSV export of participant outcomes for a cohort
- [ ] Trainer coaching notes field per participant (saved to `participants`)

**Done when:** Manager view filters to assigned team; CSV export downloads with correct data; trainer can add and save a coaching note.
