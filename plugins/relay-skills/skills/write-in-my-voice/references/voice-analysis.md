# Building the voice profile

The profile is the deliverable of calibration. It must be specific enough that someone who has never read the corpus could hold a draft against it and say which rules the draft breaks.

## Write rules with rates, not presence

The dominant failure mode is caricature. A rule that says `uses em dashes` produces a draft with an em dash in every sentence. The author used them in one paragraph out of six.

Every stylistic rule carries a frequency, taken from `metrics.json`:

- Bad: `Uses sentence fragments for emphasis.`
- Good: `Uses sentence fragments for emphasis, roughly one per 150 words, almost always immediately after a long sentence.`

- Bad: `Writes short sentences.`
- Good: `Mean 11 words, median 9.5, stdev 6.5. About 30% of sentences are 5 words or fewer; none exceed 26. The variance is the point — short declaratives punctuate longer explanatory ones.`

Any trait a draft could overdo needs a ceiling.

## Reading the metrics

`metrics.json` gives you counts. Interpretation is yours.

- **`sentence_words.stdev` matters more than `.mean`.** Low variance reads mechanical at any average length. If stdev is above roughly half the mean, rhythm is a defining feature and the profile must say so.
- **`sentence_mix.very_short_pct`** tells you whether one-punch sentences are a real habit. Above about 20% they are load-bearing.
- **`per_1000_words.contractions`** separates spoken-register writing from formal. Compare across registers; a large gap is one of the strongest register deltas you will find.
- **`pronoun_ratio_i_to_we`** is a stance signal. Heavy `I` means personal ownership of claims; heavy `we` means institutional voice. Shifts by register, and getting it wrong is immediately noticeable.
- **`sentence_initial_connectives.pct_of_sentences`** measures how spoken the prose is. Starting sentences with `But` or `So` is a habit most formal training suppresses; if the author does it, a draft that never does will feel stiff.
- **`ai_tell_usage`** is the useful half of the tell list: those are the author's genuine words, and banning them would be wrong.
- **`ai_tells_never_used`** becomes the ban list directly. This is evidence, not taste — the author demonstrably does not use these words.
- **`common_openers`** shows how they enter a piece. Look for whether the first sentence states the conclusion, the context, or the ask.
- **`vocabulary_diversity`** is normalized by length, so compare registers only at similar sample sizes.

Where a metric contradicts your impression from reading, the metric wins. That is why it exists.

## Dimensions to extract

Read the corpus closely for each. Record only what the evidence supports.

**Structure and argument**
- Where the conclusion sits: first sentence, after context, or last.
- How a piece is entered — straight in, one line of orientation, or a pleasantry.
- Sequencing habits: claim then reason, reason then claim, narrative, numbered.
- How disagreement is registered, and how directly.
- How bad news is delivered: up front, cushioned, or with cause first.
- Whether they signpost (`three things here`) or just proceed.
- How pieces end: action, question, offer, or a hard stop with no closer.

**Rhythm**
- Sentence length distribution and variance, from the metrics.
- Fragment use and its position.
- Paragraph size, and whether one-line paragraphs are used for weight.
- Whether they vary rhythm deliberately at emphasis points.

**Diction**
- Words and constructions they reach for repeatedly — the `frequent_words` list, filtered to the distinctive ones.
- Words they never use, especially the never-used tells.
- Technical density, and whether they explain jargon or assume it.
- Contraction rate, slang, profanity tolerance, per register.
- Concrete versus abstract nouns. Most voice differences live here.

**Stance**
- Hedging rate and the specific hedges used. Note the difference between hedging a claim and stating uncertainty plainly — they read completely differently.
- Whether they assert, ask, or propose.
- Warmth markers, and where they appear (opening, closing, throughout, absent).
- Humor: type, frequency, and whether it survives into serious contexts.
- How they handle their own errors.

**Mechanics**
- Punctuation habits with rates: em dash, colon, semicolon, parentheses, ellipsis.
- Capitalization and sentence case in headings.
- List tolerance — do they bullet, or write prose where a model would bullet? This is one of the most reliable AI tells and one of the most valuable rules to capture.
- Emoji and formatting per register.

**Social moves**
- Greeting and sign-off per register, including their absence.
- How they ask for something.
- How they say no.
- How they acknowledge or praise.

## Structure of the profile

Two layers, per the template in [../assets/profile-template.md](../assets/profile-template.md):

1. **Core voice** — traits stable across every register. If a trait varies by register, it is not core; move it down.
2. **Register deltas** — only what differs, expressed against core. Do not restate core traits per register; the duplication drifts out of sync as the profile is refined.

## The anti-tells section

This section does the most work at draft time, because generic-model prose has a strong default gravity and stating what to avoid counters it more effectively than describing what to aim for.

Build it from three sources:

1. **Never-used tells** from `ai_tells_never_used`. Direct ban list, evidence-backed.
2. **Structural AI habits** the corpus contradicts. Common ones: bulleting what the author writes as prose; tricolon everywhere; opening with a restatement of the question; closing with a summary paragraph the author would never write; `It's not just X, it's Y`; `Here's the thing`; symmetrical paragraph lengths; hedging every claim.
3. **Caricature risks** — the author's own distinctive traits, with the note that overuse is as wrong as absence. Anything memorable enough to notice is something a draft will overdo.

## Cross-validate on two axes

Where the corpus allows it, test every core trait twice:

- **Across registers.** A trait present in chat, email and public writing is core. A trait in only one is a register delta, however striking it looks.
- **Across eras.** Same register, samples years apart. This separates stable voice from drift. In practice, vocabulary and punctuation habits are stable while formatting and stance move — one measured case showed identical em-dash and vocabulary behavior two years apart, while mean sentence length fell by a third, bullet use rose tenfold, and the first-person-singular to plural ratio inverted.

A trait surviving both axes is as close to certain as this method gets. Say so in the profile, and say which axis a weaker trait failed.

## Confidence and gaps

Label each rule with its evidence base. A rule from 30 samples and a rule from 3 are not the same claim.

- `strong` — consistent across 15+ samples in that register.
- `moderate` — consistent across 5–14, or strong but with exceptions.
- `tentative` — under 5 samples, or the corpus disagrees with itself.

Mark contradictions rather than resolving them by averaging. `Sign-off varies: no closer in 6 samples, "Thanks" in 4, no discernible pattern by recipient` is honest and useful. An invented rule is worse than a named gap, because a draft built on it fails in a way nobody can trace.

Do not fill a template section for completeness. `Insufficient evidence` is a valid and useful entry.
