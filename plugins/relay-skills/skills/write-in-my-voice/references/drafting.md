# Drafting, revising, auditing, refining

## Voice is structural before it is verbal

The tempting workflow — draft normally, then translate the sentences into the voice — cannot work. It produces generic structure wearing the author's vocabulary, which reads worse than either, because the mismatch is audible without being locatable.

Structure is where voice lives first:

- Where the conclusion sits.
- Whether the piece opens with orientation or goes straight in.
- Whether the content is bulleted or written as prose.
- How long the whole thing is.
- Whether it closes with an action, a question, or nothing.

All of those are decided before the first sentence. Apply the profile at the planning stage.

## Drafting

1. Read `profile.md` and the target register's section. Read the excerpt anchors for that register immediately before writing; they prime rhythm in a way rules cannot.
2. Decide the substance separately and briefly — what this piece claims, in what order, and what it asks for. Keep it in notes, not prose.
3. Shape that outline using the register's structural rules: conclusion placement, opener, prose or list, closer.
4. Check the target length against `sample_words` for that register. Length is a voice trait and the most commonly missed one. A 400-word answer in a register whose median is 90 is wrong however well written.
5. Write. Apply core voice plus register deltas together.
6. Run the self-check. Fix what fails.
7. Deliver the draft for the subject's review. Do not represent it as already authored, approved, or sent by them.

Drafting does not authorize delivery. Never send, post, publish, sign, or submit the text from this workflow without a separate user request and appropriate tool authority. Decline uses intended to impersonate a third party, forge approval, or evade authorship or identity checks.

Do not append notes on which voice traits you applied. Commentary about the voice is not in the voice, and it invites the user to review your reasoning instead of the writing.

## The self-check

Run before every delivery. Check the draft, not your intent.

**Banned material**
- Any word on the ban list from `ai_tells_never_used`.
- Structural AI habits listed in the profile's anti-tells.

**Rates against the profile**
- Sentence length: does the mean land near the register's, and is the variance there? Uniform sentence length is the most common failure.
- Are distinctive traits within their stated ceilings, not applied to every sentence?
- Contraction rate roughly matching the register.
- Bullets only where the author bullets. If the profile says they write prose here and the draft has a list, that is a failure regardless of how clean the list is.
- Hedging rate — models hedge far above most authors' baseline.

**Structure**
- Conclusion in the right position.
- Opening matches the register's habit.
- Length within the register's range.
- Closer matches, including its absence.

**Read it aloud, in their voice**
- Any sentence you cannot imagine them saying gets rewritten. This catches what the rules miss.
- Any sentence that would fit equally well in anyone's writing is a sign the draft has drifted to the generic default.

If a check fails and the profile's rule seems wrong for this context, follow the profile and flag the tension to the user. Do not silently override a calibrated rule.

## Revising

Change how it sounds. Do not change what it says.

- **Substance** — claims, facts, numbers, commitments, the argument, the ask, the recipients. Preserve exactly.
- **Sound** — word choice, sentence shape, order of presentation, formatting, length, opener, closer. All in scope.

Reordering to put the conclusion first is a voice change, not a substance change, and is usually necessary.

If the source text contains a claim you cannot verify or that seems wrong, keep it and flag it separately. Silently dropping a claim during a voice pass is how a revision loses something that mattered.

Report nothing about what you changed unless asked. If asked, name the structural changes first; those are what the user will notice.

## Auditing

Score a draft without rewriting it. Report:

1. Which specific profile rules the draft breaks, quoting the offending text and naming the rule.
2. The measured gaps: sentence length mean and variance versus the register's, contraction rate, bullet use, length.
3. The three highest-impact fixes, in order.

Do not soften the report. An audit that says the draft is broadly fine is worthless if it is not.

Where the draft is long enough for measurement to be meaningful, run it through the metrics script to compare against the register rather than estimating by eye:

```bash
python3 scripts/stylometrics.py /path/to/draft.jsonl
```

## Refining from edits

The subject's edit of your output is high-value evidence when they directly authorized the profile. It is a direct correction against a known error and targets exactly where the profile is wrong.

1. **Diff.** Compare their version to yours. Separate substance edits (they changed the meaning — not voice evidence) from voice edits (same meaning, different expression — the signal).
2. **Classify each voice edit:**
   - *Wrong rule* — the profile stated something the edit contradicts. Correct the rule and record what it was.
   - *Missing rule* — the profile was silent and the edit reveals a habit. Add it, at `tentative` confidence until it recurs.
   - *Contextual* — a choice specific to this piece, audience, or moment. Do not generalize. Over-generalizing one-offs is how a profile degrades into a list of contradictions.
3. **Propose** the profile change to the user before writing it. Show the old rule, the new rule, and the edit that prompted it.
4. **Append** to `changelog.md`: date, rule changed, evidence, confidence.

When corrections repeat, raise confidence and stop treating it as contextual. Three corrections of the same kind mean the profile has a wrong rule — look for the rule rather than patching the symptom each time.

If an edit contradicts a `strong` rule backed by many samples, do not overwrite it on one instance. Note the exception, watch for recurrence, and ask whether the voice is changing or the context was unusual. Both happen, and they need different responses.
