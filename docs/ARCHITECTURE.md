# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend / DB:** Supabase (Postgres + Auth + RLS)
- **Hosting:** Vercel
- **AI calls:** OpenAI API via Next.js server actions (key never in client)

## What to Build Now vs Later
| Now (v1) | Later |
|---|---|
| 6-step guided workflow | AI prompt auto-evaluation |
| Participant dashboard | Workflow sharing |
| Playbook library | Detailed ROI analytics |
| Trainer /admin panel | Manager team dashboards |
| Auth gateway | Enterprise integrations |

## Key User Action — Step by Step
1. Participant lands on app (demo data visible, no login required in early build)
2. Clicks "Start a new workflow" → form saved to `work_problems`
3. Defines use case → saved to `use_cases`
4. Writes and iterates prompts → each version saved to `prompts`
5. Logs experiment runs (what worked / failed) → saved to `experiments`
6. Saves winning workflow as playbook → saved to `playbooks`
7. Records outcome (time saved, business result) → saved to `outcomes`
8. Trainer views all records in `/admin`

## Layer Plan
1. **Data first** — all tables, constraints, RLS policies, seed data
2. **App logic** — CRUD forms, step navigation, status transitions
3. **Smart features** — AI prompt suggestions, outcome summaries (drafted, participant approves)

## Core Without AI
Every step is a form. AI is additive (draft suggestions). The workflow completes fully with AI off.
