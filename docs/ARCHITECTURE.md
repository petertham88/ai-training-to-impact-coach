# Architecture

## Stack
- **Frontend** Next.js 14 (App Router) + Tailwind + shadcn/ui — Vercel
- **Backend** Supabase (Postgres + Auth + RLS + Storage)
- **AI** OpenAI API (prompt suggestions, outcome summaries) — server-side only

## Now vs Later
| Now (v1) | Later |
|---|---|
| Guided 6-step participant flow | Workflow sharing between participants |
| Prompt versioning | Auto prompt evaluation / scoring |
| Experiment log | AI agent that drafts full playbooks |
| Manager dashboard | Enterprise SSO / LMS integration |
| `/admin` trainer view | Detailed ROI analytics |

## Key User Action — Step-by-Step
1. Participant submits a **work problem** (free text + category)
2. App structures it into a **use case** (title, process, goal)
3. Participant writes a **prompt**; AI suggests improvements (server route, key never in browser)
4. Participant logs an **experiment** (result, rating, notes)
5. On success, participant saves a **playbook** (frozen snapshot)
6. Participant records an **outcome** (time saved, quality gain, business impact)
7. Manager dashboard reads aggregated rows — live from DB

## Layer Plan
1. **Data first** — tables + RLS + seed data
2. **App logic** — CRUD forms, guided stepper, dashboard queries
3. **Smart features** — AI prompt suggestions, outcome summaries (can be disabled; core still works)
