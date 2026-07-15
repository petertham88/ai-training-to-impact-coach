// AI / intelligence layer (v1).
//
// Every suggestion is a DRAFT the participant approves before it is trusted
// (medium-risk per docs/AGENTIC_LAYER.md). If OPENAI_API_KEY is set these tools
// could call a model; it is not set on this project, so v1 ships a deterministic
// rule-based fallback. The core workflow works fully with AI switched off.

export type Suggestion = {
  value: string;
  source: string; // e.g. "rule-based/v1" or "openai/gpt-4o"
  confidence: number; // 0..1
};

const RULE_SOURCE = "rule-based/v1";

function firstSentence(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, " ");
  const cut = t.split(/[.!?]/)[0] ?? t;
  return cut.length > max ? cut.slice(0, max).trim() + "…" : cut;
}

function categoryFor(text: string): string {
  const t = text.toLowerCase();
  if (/(report|status|summary|dashboard|update)/.test(t)) return "reporting";
  if (/(email|message|reply|follow.?up|outreach|letter)/.test(t))
    return "drafting";
  if (/(analy|variance|forecast|number|data|calcul|budget)/.test(t))
    return "analysis";
  if (/(job description|jd|policy|contract|document|draft|write)/.test(t))
    return "drafting";
  if (/(schedul|plan|coordinat|roster|calendar)/.test(t)) return "planning";
  return "general productivity";
}

// suggest_use_case(problem_text) → draft use case object
export function suggestUseCase(
  problemTitle: string,
  currentProcess?: string | null,
): Suggestion {
  const category = categoryFor(`${problemTitle} ${currentProcess ?? ""}`);
  const focus = firstSentence(problemTitle);
  const value = `Use an AI assistant (e.g. ChatGPT) to speed up ${category} for "${focus}". Feed in your raw inputs and have the AI produce a structured first draft you review and finalise, instead of starting from a blank page each time.`;
  return { value, source: RULE_SOURCE, confidence: 0.72 };
}

// suggest_prompt_improvement(prompt_text, experiment_notes) → improved draft
export function suggestPromptImprovement(
  promptText: string,
  experimentNotes?: string | null,
): Suggestion {
  const hasRole = /you are|act as/i.test(promptText);
  const hasFormat = /(format|structure|bullet|sections?|steps?|\[|\{)/i.test(
    promptText,
  );
  const hasInput = /\{\{.*?\}\}|\[.*?\]|:\s*$/.test(promptText);

  const additions: string[] = [];
  if (!hasRole)
    additions.push(
      "Open with a role: e.g. \"You are an experienced [domain] specialist.\"",
    );
  if (!hasFormat)
    additions.push(
      "Specify the exact output structure you want (named sections or a bullet list).",
    );
  if (!hasInput)
    additions.push(
      "Add a clearly marked placeholder for your input, e.g. {{input}}.",
    );
  additions.push(
    "End with constraints: tone, length, and \"ask me for anything missing before answering.\"",
  );
  if (experimentNotes && experimentNotes.trim()) {
    additions.push(
      `Address what failed last run: ${firstSentence(experimentNotes, 120)}.`,
    );
  }

  const improved = `${promptText.trim()}\n\n— Suggested refinements —\n- ${additions.join("\n- ")}`;
  const confidence = additions.length <= 2 ? 0.8 : 0.68;
  return { value: improved, source: RULE_SOURCE, confidence };
}

// summarise_outcome(outcome_fields) → narrative summary (low-risk, auto)
export function summariseOutcome(fields: {
  time_saved_per_week_hours?: number | null;
  quality_improvement?: string | null;
  business_result?: string | null;
  confidence_level?: string | null;
}): Suggestion {
  const hrs = fields.time_saved_per_week_hours;
  const parts: string[] = [];
  if (hrs != null && !Number.isNaN(hrs)) {
    const annual = Math.round(hrs * 46); // ~46 working weeks
    parts.push(
      `Saves about ${hrs} hour${hrs === 1 ? "" : "s"} per week (~${annual} hours/year).`,
    );
  }
  if (fields.quality_improvement?.trim())
    parts.push(`Quality: ${firstSentence(fields.quality_improvement, 140)}.`);
  if (fields.business_result?.trim())
    parts.push(`Business impact: ${firstSentence(fields.business_result, 140)}.`);
  if (fields.confidence_level)
    parts.push(`Confidence in this result: ${fields.confidence_level}.`);

  const value =
    parts.length > 0
      ? parts.join(" ")
      : "Outcome recorded. Add time saved and a business result to generate a fuller summary.";
  return { value, source: RULE_SOURCE, confidence: 0.9 };
}

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
