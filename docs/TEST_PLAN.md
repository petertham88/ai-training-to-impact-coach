# Test Plan

## Primary Scenario — Full Workflow End-to-End

**Setup:** Open app as demo participant (seeded or newly signed up). No prior workflow exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Start new workflow" | Step 1 form appears; work_problems table empty for this user |
| 2 | Fill in work problem title, description, current process; submit | Row saved to `work_problems`; step indicator advances to Step 2 |
| 3 | Fill in use case title, AI tool, objective; submit | Row saved to `use_cases`; step 3 unlocked |
| 4 | Type a prompt; save; edit and save again as version 2 | Two rows in `prompts` with version 1 and 2; version list visible |
| 5 | Log experiment: fill what worked, what failed, output quality; submit | Row saved to `experiments` |
| 6 | Save playbook: confirm workflow steps, select winning prompt; submit | Row saved to `playbooks`; playbook appears in library |
| 7 | Record outcome: enter time saved, business result; submit | Row saved to `outcomes`; outcome visible on playbook detail |
| 8 | Refresh browser | All data persists; step indicator still shows complete |

## Empty State Tests
- New participant visits `/dashboard` → sees "No workflows yet" with a clear CTA
- Playbook library with no saved playbooks → sees empty state message, not a blank page
- Experiment log with no entries → prompt to log first experiment

## Error State Tests
- Submit Step 1 form with title blank → inline validation error, no DB write
- Simulate network failure on form submit → error banner "Could not save — please try again"; no silent failure
- Non-trainer email visits `/admin` → 403 page, not a blank screen
- Unauthenticated user visits `/dashboard` (post lock-down) → redirect to `/login`

## Permission Tests (post Sprint 4)
- User A logs in; creates a work problem
- User B logs in; cannot see User A's work problem in any query or URL
- Trainer logs into `/admin`; sees both users' records

## Data Integrity Tests
- Delete a work problem → confirm associated use_cases, prompts, experiments are handled (cascade or block)
- Mark outcome `verified_by_manager = true` → value persists after refresh
- AI suggestion saved with `review_status = 'unreviewed'` → participant can approve or dismiss, status updates
