# Agentic Layer

## Risk Levels & Actions

### Low — Auto-execute (no approval)
- **Tag use case category** from problem description (e.g. "reporting", "drafting", "analysis")
- **Summarise experiment notes** into a 2-line what-worked / what-failed summary
- **Generate outcome summary** paragraph from recorded metrics

### Medium — Draft → Participant approves before saving
- **Suggest use case** from work problem description
- **Suggest prompt improvement** from current prompt + experiment feedback
- **Draft playbook workflow steps** from completed experiments

### High — Always requires explicit approval
- **Send progress report to manager** (email via Resend)
- **Flag participant as stuck** and notify trainer

### Critical — Human only (no agent)
- Delete a participant record
- Export bulk outcome data to client
- Any action touching personal data at scale

## Named Tools (v1)
- `suggest_use_case(problem_text)` → draft use case object
- `suggest_prompt_improvement(prompt_text, experiment_notes)` → improved prompt draft
- `summarise_outcome(outcome_fields)` → narrative summary

## Audit Log Fields
`actor_email, action, object_type, object_id, detail{input, output, model, confidence}, created_at`

## v1 Scope
Only low and medium actions ship in v1. High and critical actions are v2.
