# Voice profile — [name]

Calibrated [date] from [N] samples. Sources: [slack N, email N, drive N, published N].
Window: [start]–[end]. Metrics: `~/.codex/voice/[profile-id]/metrics.json` when local persistence was approved.

Confidence on every rule: `strong` (15+ samples), `moderate` (5–14), `tentative` (<5).
Delete any section without evidence, or mark it `insufficient evidence`. Do not fill for completeness.

---

## Core voice

Traits that hold in every register. If it varies by register, it belongs in a delta below.

### In one paragraph

[Three or four sentences a stranger could use to recognize this writing. Concrete, not adjectival.]

### Structure and argument

- Conclusion placement: [where, with confidence]
- Opening habit: [how pieces are entered]
- Argument sequencing: [claim-then-reason, narrative, etc.]
- Disagreement: [how registered, how directly]
- Bad news: [up front / cause first / cushioned]
- Signposting: [used or not]
- Closing: [action, question, offer, hard stop]

### Rhythm

- Sentence length: mean [x], median [x], stdev [x], p90 [x], max [x]
- Sentences ≤5 words: [x]% — [what they do structurally]
- Paragraph size: [x] words / [x] sentences typical
- One-line paragraphs: [used for what, how often]
- Fragments: [rate and position]

### Diction

- Reaches for: [distinctive words and constructions, with rates]
- Never uses: [from `ai_tells_never_used` plus close reading]
- Contractions: [rate per 1,000 words]
- Technical density: [level; explains or assumes]
- Concrete vs abstract: [tendency]
- Slang / profanity: [tolerance by register if it varies — else here]

### Stance

- Hedging: [rate, and which hedges]
- Uncertainty: [stated plainly or hedged — these read differently]
- Assertion: [asserts, asks, or proposes]
- `I` to `we` ratio: [x]
- Warmth: [markers and where they appear]
- Humor: [type, frequency, whether it survives serious contexts]
- Own errors: [how handled]

### Mechanics

- Em dash: [per 1,000] · Colon: [x] · Semicolon: [x] · Parentheses: [x] · Ellipsis: [x]
- Lists: [does the author bullet, or write prose where a model would bullet?]
- Headings: [style and casing]
- Emphasis: [bold, italic, caps, or none]

---

## Register deltas

Only what differs from core. Do not restate core traits — duplication drifts out of sync during refinement.

### slack-internal — [N samples]
- Length: [median words]
- Greeting / sign-off: [including absence]
- Differs from core: [list only the deltas]
- Emoji: [rate]

### slack-external — [N samples]
- [as above]

### email-client — [N samples]
- Length: [median words]
- Greeting / sign-off: [including absence]
- Differs from core: [deltas]
- Asks: [how requests are made]

### email-internal — [N samples]
- [as above]

### doc-longform — [N samples]
- [as above]

### published-public — [N samples]
- [as above; note this register is the most edited and least like unaided writing]

---

## Anti-tells

The section that does the most work at draft time.

### Banned words
[From `ai_tells_never_used` — evidence-backed, the author demonstrably does not use these.]

### Banned structures
[AI habits the corpus contradicts. E.g. bulleting what this author writes as prose; opening by restating the question; closing with a summary paragraph; `It's not just X, it's Y`; symmetrical paragraph lengths; hedging every claim.]

### Caricature risks
[The author's own distinctive traits, with ceilings. Anything memorable enough to notice is something a draft will overdo.]

---

## Known gaps and contradictions

- [Registers with thin evidence, and what that means for drafts in them]
- [Traits where the corpus disagrees with itself — record the disagreement, do not average it]
- [Contexts never observed: e.g. no samples of writing to a hostile audience]

---

## Changelog pointer

When local persistence was approved, profile changes are recorded in `~/.codex/voice/[profile-id]/changelog.md` with date, rule, evidence, and confidence.
