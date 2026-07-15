# Security

## Secret Handling
- `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel environment variables only
- Never referenced in client components or exposed in API responses
- All AI calls made from Next.js server actions — client receives only the result

## Permission Model
| Role | Access |
|---|---|
| Anonymous (demo) | Read seeded demo data only (v1 open policy) |
| Participant | Own records only (after lock-down sprint) |
| Manager | Read their team's records (after lock-down sprint) |
| Trainer/Admin | All records via `/admin` (email-checked server-side) |

- `/admin` checks `session.user.email === process.env.TRAINER_EMAIL` server-side before rendering
- After lock-down: RLS policies enforce `auth.uid() = user_id` on all tables
- Agents inherit the calling user's session — no elevated permissions

## Approved Tools Rule
- Only named, explicitly defined server actions may call external APIs
- No `eval`, `run_any`, or dynamic tool construction
- Every agent action writes to `audit_logs` before returning

## Audit Principle
Every create / update / delete and every AI action writes one row to `audit_logs` with actor, action, object reference, and detail payload. Logs are append-only (no delete policy on `audit_logs`).

## Honest Gaps (address before real users)
- Email verification not implemented in v1 — add before opening to real cohorts
- Manager role scoping is manual in v1 — formalise with a `roles` table at lock-down
- If handling real employee data, confirm with a human whether GDPR processor agreements are needed
