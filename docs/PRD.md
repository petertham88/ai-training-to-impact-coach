# Product Requirements Document

## Problem
Employees who attend AI training rarely apply it at work. There is no system to guide them from a real task to a tested, measurable AI-assisted workflow — and no way for managers or trainers to see who has actually changed their work.

## Target Users
- **Participants** — employees/executives who attended an AI training program
- **Managers / HR / L&D** — need adoption and impact evidence
- **Trainer (admin)** — reviews progress, spots blockers, demonstrates ROI to clients

## Core Objects
`work_problems` · `use_cases` · `prompts` · `experiments` · `playbooks` · `outcomes` · `users`

## MVP Must-Haves
- [ ] Participant guided flow: problem → use case → prompt → experiment → playbook → outcome
- [ ] Prompt editor: create, iterate, save versions
- [ ] Experiment log: record what worked / failed
- [ ] Playbook save: lock a successful workflow as reusable
- [ ] Outcome entry: time saved, quality improvement, business result
- [ ] Manager dashboard: adoption counts, use cases in progress, completed playbooks, stuck participants
- [ ] `/admin` route gated to trainer login only
- [ ] Full app requires email + password login (gateway restriction)
- [ ] Seed demo data so app renders immediately on first visit

## Non-Goals (v1)
Enterprise integrations, automatic prompt evaluation, workflow sharing, ROI analytics engine, multilingual support, gamification, advanced AI agents, confidential-document handling.

## Success Criteria
A participant logs in, enters a real work problem, works through every step, saves a playbook, records time saved, and that result appears on the manager dashboard — end to end, no dead buttons, data persists on refresh.
