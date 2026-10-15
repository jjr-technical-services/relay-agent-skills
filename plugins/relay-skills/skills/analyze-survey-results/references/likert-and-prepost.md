# Likert items and pre/post comparisons

## Likert items

A Likert item asks for agreement (or frequency, likelihood) on an ordered scale. The scale is ordinal: the order is meaningful, but the distance between "Agree" and "Strongly agree" is not known to equal the distance between "Neither" and "Agree".

Report:

- The full distribution in scale order, with counts and percentages of valid responses.
- Top-2-box: share choosing the top two points (for a 5-point agreement scale, Agree + Strongly agree). Bottom-2-box is useful for items where disagreement is the concern.
- The valid n and how many chose "Prefer not to say" or left it blank.

On averaging, practitioners disagree. Decision rule:

- **Single items:** report the distribution and top-2-box. A mean can hide polarization (half strongly agree, half strongly disagree averages to neutral). If a stakeholder asks for a mean, give it as a secondary figure beside the distribution, with a median.
- **Multi-item scales** (several items designed to measure one construct): compute a scale score exactly as the instrument's scoring guide says, which is often a sum or mean of items. Means of scale scores are standard.
- Do not average across items that measure different things.

Neutral midpoint: report it; do not fold it into agree or disagree.

## Pre/post comparisons

### Matched pairs

Pre and post responses linked by a code for the same person.

- Report the number of matched pairs and how many pre-only and post-only responses could not be matched.
- For each item: counts who moved up, stayed the same, moved down; top-2-box before and after among the matched pairs.
- A test for the change in a yes/no outcome (in or out of the top box) among the same people is McNemar's test. With b = moved into the top box and c = moved out, the exact version is a two-sided binomial test of b against n = b + c at probability 0.5. For the full ordinal scale, the Wilcoxon signed-rank test is common. With small samples, report counts and treat tests as secondary; a non-significant result in a small group is not evidence of no change.

### Unmatched comparisons

Anonymous pre and post surveys cannot be linked. The two waves may contain different people, and people who left the program may be missing from the post wave.

- Label the section "Unmatched comparison" and give each wave's n.
- Compare distributions and top-2-box between waves. Say "the share of post respondents who agreed was higher than the share of pre respondents", not "participants improved".
- Do not compute individual change or pool unmatched and matched data.

### Retrospective pre-post items

Items asking participants at the end to rate "before the program" and "now" are matched by design (same person, same moment). Report as matched pairs, and note the reliance on recall.

## Crosstabs

- Rows are groups, columns are answer categories; percentages are of the row's valid n.
- Show the row n. Apply suppression before calculating what to show.
- Do not run many significance tests across many crosstabs and report only the "significant" ones; if tests are used, state how many were run.

## Wording results

| Data | Say | Avoid |
|---|---|---|
| Post-only survey | "Among respondents, 70% agreed they know where to find support." | "70% of participants now know..." (if response was partial) |
| Unmatched pre/post | "The share agreeing was 45% in the pre survey and 65% in the post survey (different respondents)." | "Scores improved by 20 points." |
| Matched pre/post | "Of 40 people who completed both surveys, 18 moved up on this item, 17 stayed the same and 5 moved down." | "The program caused..." |
| Any | "self-reported confidence", "reported intention to seek help" | "improved mental health", "reduced anxiety" |
