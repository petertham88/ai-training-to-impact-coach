# Security

## Secrets
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars only — never in client bundles or API responses
- All AI calls go through `/api/ai/*` server routes; browser never touches the key

## Permission Model
| Role | Can do |
|---|---|
| Anonymous (demo) | Read seeded demo rows (v1 only, removed at lock-down) |
| Participant | CRUD own problems, use cases, prompts, experiments, playbooks, outcomes |
| Manager | Read all participant rows in their cohort; no write |
| Admin (trainer) | Full read; `/admin` route; cannot delete without confirmation |

## Approved Tools Rule
Only `suggest_use_case`, `improve_prompt`, `summarise_outcome` may call the AI. No `run_any` or `send_any` patterns. Each tool validates input server-side before calling OpenAI.

## Audit Principle
Every meaningful write (create/update/delete on core tables) appends a row to `audit_logs`. Agent actions include `tool_name` and `confidence` in the payload. No audit row = action did not happen.

## Lock-Down Sprint
Replace v1 permissive RLS policies with `auth.uid() = user_id` owner-scoped policies. Add `/admin` middleware check (`role = admin`). Remove anonymous read policies.
