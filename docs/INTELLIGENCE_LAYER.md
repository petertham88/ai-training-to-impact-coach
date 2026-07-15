# Intelligence Layer

## Messy Inputs
- Free-text work problem descriptions (vague, jargon-heavy)
- Unstructured prompt drafts
- Informal experiment notes

## Auto-Structure Schema (use case suggestion)
```json
{
  "suggested_title": "Summarise weekly client reports",
  "goal": "Reduce report-reading time by 50%",
  "ai_fit_score": 0.82,
  "source": "gpt-4o",
  "confidence": 0.82,
  "review_status": "unreviewed"
}
```

## Events to Track
- Problem submitted
- Use case created
- Prompt version saved
- Experiment marked success/failed
- Playbook saved
- Outcome recorded

## Scoring Rules (v1 rule-based)
- **AI fit score** = keyword match (repetitive/data/drafting/search) → 0.0–1.0
- **Progress score** = steps completed / 6
- **Impact score** = `time_saved_hours × 52` (annualised)

## What Gets Ranked
- Participants by progress score (manager dashboard)
- Use cases by AI fit score (trainer admin view)

## v1 vs Later
| v1 | Later |
|---|---|
| Rule-based AI fit scoring | ML model trained on past use cases |
| GPT prompt improvement suggestions | Automatic prompt evaluation + rating |
| Plain outcome summary | ROI dashboard with trend lines |
