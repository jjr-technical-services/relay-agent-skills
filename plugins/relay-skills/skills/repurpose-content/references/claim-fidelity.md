# Claim fidelity

How to build the source claim register, keep statistics honest, catch drift, and set
reading level.

## Source claim register fields

| Field | What to record | Why |
| --- | --- | --- |
| Claim ID | C1, C2 ... in source order | Lets every asset sentence point back to one claim |
| Claim as approved | The exact published wording, or the closest faithful paraphrase marked as such | The reference point for every later wording change |
| Type | Statistic, finding, quote, recommendation, program fact, definition | Different types carry different rules (below) |
| Where in source | Page, section, slide, or timestamp | Lets a reviewer check in seconds |
| Base, population, period | Who was measured, how many, where, when | The three things most often lost in reuse |
| Limits on use | Caveats the source states, embargo, partner approval, "do not use for fundraising" | Carried into every asset that uses the claim |

Record quotes with the speaker's name or role exactly as approved and whether the
speaker approved reuse beyond the source. A quote approved for a report is not
automatically approved for a paid ad or a partner's channel.

## Statistic rules

1. **Keep the number as published.** Do not re-round. If the source says 38 percent, the
   asset says 38 percent. "Nearly 4 in 10" is acceptable only if the content owner
   approves it as a Wording change, and only when the number is 38 or 39 percent, not
   when it is 35.
2. **Keep the base.** Name who was asked in the same sentence or an attached note:
   "38 percent of the 800 students surveyed". A chart needs the base in the caption.
3. **Keep the population.** College students at four campuses are not "young people",
   "students", or "Gen Z". Widening the population is a new claim.
4. **Keep the period.** "In spring 2026" or "in the past month" stays attached when the
   measure is time-bound.
5. **Keep the measure.** "Said they would know where to find help" is a self-reported
   intention. It is not "know where to find help" and it is not "found help".
6. **Keep the caveat.** Correlational findings stay correlational: "students who
   attended were more likely to say ..." never becomes "attending makes students ...".
7. **Name the source.** "In a poll the organization commissioned from a polling firm"
   or the source title. Never "studies show" or "research proves".
8. **Subgroups.** Do not quote a subgroup figure the source reports with a caveat about
   small numbers, and never compute new subgroup figures from the source's tables.
9. **Percent versus percentage points.** A change from 30 to 36 percent is a rise of
   6 percentage points, or 20 percent in relative terms. Use whichever the source uses
   and label it.

## Drift patterns to catch

| Pattern | Example of the problem (described, hypothetical) | Fix |
| --- | --- | --- |
| Population widening | A campus survey described as covering all youth | Restore the surveyed group |
| Cause from correlation | "More likely to say" becomes "helps students" | Restore the association language |
| Intention to behaviour | "Would reach out" becomes "reached out" | Restore the self-report |
| Outcome inflation | Participation becomes improved mental health | Describe what was measured |
| Hedge removal | "May", "in this sample" dropped | Restore the hedge |
| Time drop | A one-month measure stated as ongoing | Restore the period |
| Superlative creep | "First", "only", "leading" added | Remove unless the source proves it |
| Stacked claims | Two separate findings merged into one implied result | Keep them in separate sentences |
| Clinical creep | Workshops described as reducing anxiety or treating anything | Describe participation, knowledge, or self-reported confidence only |

## Reading level

Common defaults, to be replaced with the organization's own targets:

| Audience | Default target (assumption) |
| --- | --- |
| General public, families, social posts | Grade 6 to 8 |
| Youth-facing content | At or below the youngest intended reader's grade |
| Partners, funders, campus staff | Grade 9 to 11 |
| Researchers, policy briefs | As the source, with a plain summary on top |

Flesch-Kincaid grade level:

`grade = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59`

Illustrative check (hypothetical round numbers): 100 words, 8 sentences, 140 syllables
gives 0.39 × 12.5 + 11.8 × 1.4 − 15.59 = 4.875 + 16.52 − 15.59 = 5.805, about grade 5.8.
Formulas reward short words and sentences, not clarity. After the number meets the
target, read the text aloud and check that jargon is defined and each sentence carries
one idea. Simplifying wording is a Wording change even when the meaning looks intact,
because simplification is where hedges and bases get dropped.
