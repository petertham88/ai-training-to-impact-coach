# Intelligence Layer

## Messy Inputs (what participants type)
- Vague problem descriptions: "emails take too long"
- Rough prompt attempts with no structure
- Outcome estimates like "saves loads of time"

## Auto-Structure (what the app normalises)
```json
{
  "work_problem": {
    "raw_input": "emails take too long",
    "structured_title": "Sales follow-up email drafting",
    "estimated_time_hours": 1.5,
    "frequency": "daily"
  },
  "use_case_suggestion": {
    "value": "Use ChatGPT to draft personalised follow-up emails from call notes",
    "source": "openai/gpt-4o",
    "confidence": 0.82,
    "review_status": "unreviewed"
  }
}
```

## Events to Track
- Step completed (which step, time taken)
- Prompt version created / rated
- Experiment logged (outcome quality)
- Playbook saved
- Outcome recorded and verified

## Scoring Rules (rule-based v1)
- **Workflow completion score:** steps_completed / 6
- **Outcome confidence:** high / medium / low — participant self-rates
- **Time saved:** numeric hours/week entered by participant
- **Adoption score per cohort:** playbooks_saved / participants_enrolled

## What Gets Ranked
- Participants by workflow stage (admin view)
- Use cases by time saved (trainer view)
- Prompts by participant rating (within a use case)

## v1 vs Later
| v1 (rule-based) | Later (model-based) |
|---|---|
| Step completion % | Prompt quality auto-score |
| Time saved sum | Outcome impact prediction |
| Adoption rate by cohort | Stuck-participant early warning |
