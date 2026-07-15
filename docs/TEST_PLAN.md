# Test Plan

## v1 Success Scenario (manual, end-to-end)
1. Open `/` — dashboard loads with seed data; no login prompt
2. Click "Start New Workflow" → 6-step stepper appears
3. Step 1: Enter work problem → Save → row appears in `work_problems`
4. Step 2: Create use case → click "Suggest" → AI response populates fields → Save
5. Step 3: Write prompt → click "Improve" → AI suggestion shown → Save as version 1
6. Step 4: Log experiment → rating 4/5 → mark Success → Save
7. Step 5: Save Playbook → title + steps locked → row in `playbooks`
8. Step 6: Record outcome → "2 hours saved per week" → Save → row in `outcomes`
9. Go to `/dashboard` → participant appears, progress = 100%, time saved = 2h
10. **Pass:** all 9 steps complete, data persists on hard refresh, no console errors

## Empty States
- New participant with no workflows → stepper shows "Start your first workflow" prompt, not blank screen
- Dashboard with no completed playbooks → shows "No completed workflows yet" message

## Error Cases
- AI API unavailable → form still saves; suggestion field shows "AI unavailable — enter manually"
- Submit form with missing required field → inline validation, no DB write
- Direct URL `/admin` as non-admin → redirected to `/` with "Access denied" toast

## Data Integrity
- Refresh after each step — data persists (not localStorage)
- Delete a work problem → linked use cases, prompts, experiments cascade or block with clear message
