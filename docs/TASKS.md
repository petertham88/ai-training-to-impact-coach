# Tasks & Sprints

## Sprint 1 — DB + Demo Shell (3 days)
**Goal:** Schema live, seed data visible, core screens render without login.
- [ ] Run migration SQL in Supabase
- [ ] Seed 4 demo participants, problems, use cases, prompts, playbooks, outcomes
- [ ] Next.js project scaffold + Tailwind + shadcn/ui
- [ ] Dashboard home page reads + displays seed rows (loading / empty / error states)
- [ ] Participant detail page (read-only, seed data)
- [ ] **DoD:** App loads at `/`, shows real seed data, no login required, no dead links

## Sprint 2 — Core Engine: Guided Participant Flow ✅ v1 functional
**Goal:** A participant can complete the full 6-step workflow end-to-end.
- [ ] 6-step stepper component (Problem → Use Case → Prompt → Experiment → Playbook → Outcome)
- [ ] Work problem form (create/edit/delete → persists to DB)
- [ ] Use case form with AI suggestion button (calls `/api/ai/suggest-use-case`)
- [ ] Prompt editor with version history + AI improve button
- [ ] Experiment log form (result, rating, worked/failed)
- [ ] Playbook save (snapshot prompt + steps)
- [ ] Outcome form (time saved, quality, business impact)
- [ ] All forms: loading / empty / error / success states
- [ ] **DoD:** Complete one workflow start-to-finish; every step persists; outcome appears on dashboard

## Sprint 3 — Manager Dashboard
**Goal:** Managers see adoption + impact at a glance.
- [ ] `/dashboard` aggregation queries (counts by status, stuck participants, completed playbooks)
- [ ] Participant list with progress score
- [ ] Use case list with AI fit score
- [ ] Outcome summary (total hours saved, business impact list)
- [ ] **DoD:** Dashboard reflects live DB data; updates when new outcome is added

## Sprint 4 — Lock It Down (Auth + RLS)
**Goal:** All data is owner-scoped; app is safe for real participants.
- [ ] Supabase Auth: email + password sign-up / login / logout
- [ ] Login page at `/login`; redirect unauthenticated users
- [ ] Replace v1 permissive RLS policies with `auth.uid() = user_id`
- [ ] `/admin` middleware: allow only `role = admin`
- [ ] Role assignment flow (admin sets participant/manager/admin)
- [ ] **DoD:** Participant A cannot read Participant B's data; `/admin` rejects non-admin; refresh preserves session

## Sprint 5 — Trainer Admin + Polish
**Goal:** Trainer has full visibility; app is portfolio-ready.
- [ ] `/admin` — cohort overview, stuck participants, exportable case study snippet
- [ ] Case study auto-draft (best outcome → short paragraph via `summarise_outcome`)
- [ ] Onboarding empty-state copy for new participants
- [ ] Responsive mobile layout
- [ ] Error boundary + 404 page
- [ ] **DoD:** Recruiter can open app, navigate all screens in 30 s, no broken states

## Gantt (sprint → calendar week)
```
Week 1: Sprint 1 + Sprint 2
Week 2: Sprint 3 + Sprint 4
Week 3: Sprint 5
```
