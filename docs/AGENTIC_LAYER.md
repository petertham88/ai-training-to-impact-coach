# Agentic Layer

## Risk Levels & Actions

### Low — Auto (no approval)
- Suggest use case title + goal from work problem text
- Suggest improved prompt wording
- Generate outcome summary from outcome fields
- Tag work problem category (repetitive / data / drafting / research)

### Medium — Light approval (user confirms before saving)
- Draft a full playbook structure from a successful experiment
- Pre-fill outcome fields from experiment notes

### High — Always approval (explicit user action required)
- Share a playbook with another participant
- Mark a participant as "stuck" and notify their manager

### Critical — Human only
- Delete a playbook or outcome record
- Export participant data to external system

## Named Tools (v1)
- `suggest_use_case` — POST /api/ai/suggest-use-case
- `improve_prompt` — POST /api/ai/improve-prompt
- `summarise_outcome` — POST /api/ai/summarise-outcome

## Audit Log Fields
`id` · `user_id` · `action` · `table_name` · `record_id` · `payload jsonb` · `created_at`

## v1 vs Later
- v1: three named tools, all low-risk, all server-side
- Later: agent that monitors stuck participants and drafts coaching nudges (high risk, approval required)
