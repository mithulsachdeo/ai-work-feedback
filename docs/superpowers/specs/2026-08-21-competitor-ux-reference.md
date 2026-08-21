# Competitor UX Reference — iro.ai & Coursiv

_Compiled 2026-08-21, before wireframing. Researched via web search + landing-page fetch
(Chrome browser automation wasn't available this session — extension not connected — so this
is based on public marketing copy, App Store listings, and reviews, not a live click-through).
Both competitors are curriculum-first, gamified, Duolingo-style AI-learning apps — the
opposite of our work-first, judgment-on-real-work positioning. The point here is **selective
borrowing of interaction/visual craft**, not their content model, which our specs have already
deliberately rejected (see rubric spec §7)._

---

## iro.ai — what it actually does

Hero copy: *"Learn AI like a game."* / *"5 minutes a day, real tasks, not party tricks."*
Mechanics: streaks, XP, 6 ranks (Bronze→Iridescent), an evolving mascot, timed duels against
rivals, daily challenges, weekly leaderboards, a "Prompt Lab," shareable certificates with
LinkedIn-sharing prompts. 18-29 learning paths, 345+ lessons, 2,000+ exercises. iOS only,
4.7 rating.

## Coursiv — what it actually does

Positioning: "AI Courses for Beginners | Learn AI Skills Step by Step." Onboarding is a
goal-setting quiz that generates a personalized learning plan. Lessons are one-concept,
10-15 min, read-or-listen, ending in a mini quiz. Gamification: streaks, points, daily
challenges. Mobile-first, praised in reviews for a clean dashboard and few clicks to a lesson.

---

## Borrow

**1. The bite-sized, one-thing-at-a-time lesson shape (both).** Coursiv's "one concept, then
a quick check" and iro's "5 minutes a day" pacing validate a design choice we've already
locked (§5 of the rubric spec: one glance + one fix, progressive disclosure). Borrow the
*craft* of how they achieve that feeling — tight vertical rhythm, one dominant action per
screen, minimal simultaneous choices — as a visual discipline for the feedback view, not a new
feature.

**2. Quiz-to-personalized-plan onboarding pattern (Coursiv).** The "answer a few questions →
we build this for you specifically" framing is worth borrowing as *copy tone* for our role
capture step — it should feel like the app is calibrating to the user, not just logging a
demographic field. Cheap to apply: reword the one-time role prompt to imply personalization
("this helps us tailor what 'good' looks like for your work"), which is literally already true
per the rubric spec, just not yet framed that way.

**3. Mobile-first polish, minimum taps to the core action (both, esp. Coursiv reviews).**
Both are praised specifically for low-friction navigation on a phone. Worth holding as an
explicit bar for our wireframe: purpose picker → paste box should be as few taps as their
quiz → first lesson, since our activation-critical path (first submission → first feedback) is
the exact equivalent of their first-lesson moment.

**4. Clean progress/status visualization (both — progress bars, XP bars, rank rings).**
Borrow the *visual treatment*, not the mechanic: our quota banner ("X checks left today") and
the six-criterion chip row are functionally status displays already — they can borrow
Duolingo-style clean, legible iconography and color-coded states (their strongest visual
craft) without adopting the underlying gamification logic (XP, ranks, streak-breaking).

**5. Certificate/shareable-achievement *concept*, heavily reworked.** Both products drive
growth via LinkedIn-shareable credentials by default. We can't copy this directly — our rubric
spec explicitly rejects default external visibility (it breaks the psychological-safety loop
that's the whole premise). But the *underlying insight* — people like a shareable marker of
progress — could translate into a strictly opt-in, user-initiated "share that I improved a
level" action, never auto-suggested at a moment that implies surveillance, and never required
for evaluation to work.

---

## Deliberately avoid

**1. Streaks, hearts, XP, ranks, duels — all of it.** This isn't a style note, it's already a
locked decision: rubric spec §7 explicitly contrasts our retention model against exactly this
("versus tools that must manufacture return triggers — streaks on synthetic exercises").
Real recurring work is our retention substrate; adopting streak mechanics would be building the
thing our own spec says we're structurally better than. Confirms the existing decision rather
than raising a new one.

**2. Mascot / game-character framing.** iro's penguin coach fits a playful, Duolingo-coded
audience. Our persona is a mid-career professional worried about being caught not knowing
something at work — a cartoon mascot cheering them on risks trivializing a moment that's
supposed to feel like a private, competent check, not a game session.

**3. Funnel-style urgency/scarcity marketing copy.** Common in this "AI course" category
(countdown timers, quiz-funnel high-pressure upsells — visible in several Coursiv review
sources describing its marketing funnel). This is actively in tension with "private, safe" —
a manipulative-feeling funnel undercuts trust at the exact moment a user is deciding whether to
paste in real work. Avoid entirely, including in the BYO-key upsell copy already speced.

**4. Default-on social sharing / leaderboards.** Both products' growth loops assume the user
wants their AI-learning activity visible to others by default. Our product's entire premise is
the opposite — the user needs a place nobody else sees. Any sharing must stay opt-in only, per
the "Borrow #5" caveat above.

---

## Net effect on the upcoming wireframe

Nothing here changes scope or adds a feature — it's a craft/tone reference. Concretely, when
wireframing:
- Treat the feedback view's chip row as a status/progress visualization worth real visual
  care (color, iconography), not a plain list.
- Write the role-capture screen's copy to feel like calibration, not a form field.
- Hold "minimum taps to first feedback" as an explicit wireframe constraint, benchmarked
  against how few taps these competitors need to reach their first lesson.
- Do not add streaks, XP, ranks, mascots, duels, leaderboards, or default-on sharing anywhere
  in the wireframe — these are settled exclusions, not open questions.

Sources:
- [I Tested the Coursiv AI Course: Legit or Scam? Honest Review (2026)](https://shampy.substack.com/p/i-tested-the-coursiv-ai-course-legit)
- [Coursiv Review 2026 — Pricing, Pros, Cons, and Who Should Use It](https://brandtheboss.com/coursiv-review/)
- [What is Coursiv? An Honest Review of the AI Learning Platform (2026)](https://nibble-app.com/blog/what-is-coursiv)
- [Coursiv homepage](https://www.coursiv.io)
- [Iro AI — Learn AI Skills | The Duolingo for AI](https://tryiro.com/)
- [Iro AI — Learn AI Skills - App Store](https://apps.apple.com/us/app/iro-ai-learn-ai-skills/id6759628066)
