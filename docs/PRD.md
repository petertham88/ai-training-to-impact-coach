# Product Requirements Document

## Problem
Employees and executives attend AI training but rarely change how they work. There is no system to guide them from a training session to a tested, reusable AI-assisted workflow — and no way for managers, HR, or the trainer to see who has actually implemented anything.

## Target Users
- **Participants** — employees, managers, executives who attended an AI training program, each working on real tasks from their own job
- **Managers / HR / L&D** — need a simple view of team adoption, completed workflows, and recorded results
- **Trainer (admin)** — reviews all progress, identifies blockers, demonstrates measurable outcomes to clients

## Core Objects
`participants` · `work_problems` · `use_cases` · `prompts` · `experiments` · `playbooks` · `outcomes` · `audit_logs`

## MVP Must-Haves
- [ ] Guided 6-step workflow: Problem → Use Case → Prompts → Experiment → Playbook → Outcome
- [ ] Every step persists to the database; no dead buttons
- [ ] Participant dashboard showing all their work problems and progress
- [ ] Playbook saved and viewable as a reusable reference
- [ ] Outcome recorded: time saved, quality improvement, business result
- [ ] Seeded demo data renders without login (instantly demoable)
- [ ] Email + password login gateway for participants
- [ ] `/admin` restricted to trainer email only — shows adoption, completions, blockers

## Non-Goals (v1)
Workflow sharing, automatic prompt scoring, ROI analytics, enterprise integrations, AI agents, multilingual support, gamification, confidential document handling.

## Definition of Done
**Pass:** A demo participant opens the app, creates a work problem, completes all 6 steps, saves a playbook, records a time-saved outcome, and the trainer sees that participant and result in `/admin` — all data persisted in the database, verified by page refresh.

**Fail:** Any step does not save, the playbook is missing after refresh, or `/admin` is accessible without the trainer login.
