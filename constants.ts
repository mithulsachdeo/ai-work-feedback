export const DAILY_QUOTA = 10;
export const MAX_QUESTIONS_PER_FEEDBACK = 10; // per evaluation_id, server-enforced
export const ASK_RPM_LIMIT = 5; // per user per rolling minute, server-enforced

export const MODELS = {
  // (updated 2026-08-22, from rubric-validation pass) gemini-2.0-flash no longer listed in
  // AI Studio; gemini-3.5-flash-lite is the current cheapest/fastest free-tier-eligible Flash
  // model and is what the rubric prompt was actually validated against.
  gemini: "gemini-3.5-flash-lite",
  anthropic: "claude-sonnet-5",
  openai: "gpt-4o",
} as const;

export const TYPES = ["work_product", "implementation_logic", "concept_articulation"] as const;
export const LEVELS = ["Emerging", "Solid", "Strong"] as const;
export const MAX_INTENT_CHARS = 300;
export const MAX_TEXT_CHARS = 8000;
export const MAX_INSTRUCTION_SUMMARY_CHARS = 2500;

// Layer 1 (artifact), Layer 2 (AI usage) — order matters for the UI chips.
export const CRITERIA = [
  { id: "accuracy",  layer: 1, label: "Accuracy & Soundness" },
  { id: "fitness",   layer: 1, label: "Fitness for Purpose" },
  { id: "clarity",   layer: 1, label: "Clarity & Completeness" },
  { id: "verified",  layer: 2, label: "Verified, not blindly trusted" },
  { id: "owned",     layer: 2, label: "Owned & in your voice" },
  { id: "understood",layer: 2, label: "Understood & defensible" },
] as const;

// (updated 2026-08-21, from spec grill) — covers storage + the free-tier Google-training
// fact in one line, rather than leaving the training fact undisclosed in-app.
export const CONSENT_LINE = "We store your submissions anonymously to improve the tool. On the free tier, your submission is also sent to Google, which may use it to improve their models.";
export const PASTE_BOX_NUDGE = "Avoid pasting anything truly confidential."; // (added 2026-08-21, from spec grill)

// (added 2026-08-21, from feature grill) "Empathy delighter" — static copy only, no
// tracking/persistence. HIGH_STAKES is always shown; LATE_NIGHT renders only when the
// client's local hour is past 21:00 (see SubmissionForm.tsx, Task 14).
export const HIGH_STAKES_LINE = "Working on something high-stakes? Take an extra pass before you check it.";
export const LATE_NIGHT_LINE = "Working late? No rush — this'll be here when you're ready.";
