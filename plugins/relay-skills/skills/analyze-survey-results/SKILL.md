---
name: analyze-survey-results
description: Turn a survey export (CSV) into a results report - cleaning duplicates, speeders and partials, response rate and nonresponse cautions, Likert distributions and top-2-box instead of inappropriate averages, matched versus unmatched pre/post, crosstabs with small-cell suppression at a user-set threshold, open-ended coding with a codebook, what can and cannot be concluded, and a plain-language summary. Includes a Python tabulation and suppression script. Use when asked to analyze survey results, summarize a feedback or pre/post survey export, report results by site or group, or write up survey findings for a funder or board. Do not use for writing survey questions (survey-designer prompt), planning an evaluation (design-program-evaluation), or interview synthesis (user-interview-synthesis prompt).
license: MIT
---

# Analyze Survey Results

Turn a raw survey export into a report that a board member, funder, or program lead can read in five minutes and trust. The method cleans the data in a documented way, reports ordinal answers as distributions, compares pre and post responses only in ways the data allows, protects respondents in small groups, and says plainly what the results do and do not show.

## Inputs to gather

- **The export:** a CSV with one row per response. Ask which columns are single-choice, which are Likert (ordered agreement or frequency scales), which are open-ended, and which identify the respondent, wave (pre or post), group (site, role, grade), and completion time.
- **The survey itself:** the question wording and response options in order. Scale order matters for top-2-box.
- **Who was invited:** the number eligible or invited, so the response rate can be computed. Without it, report response counts only and say the rate is unknown.
- **The suppression threshold:** the smallest group size the organization will report. If none is given, use 10 and label it "Assumed: suppression threshold 10 until the organization confirms a value". Honour any rule the user states, such as a board rule.
- **The question the report must answer** and its audience (program team, board, funder, participants).
- **Pre/post linking:** whether respondents used a code that links their pre and post answers. If not, the comparison is unmatched.

Participant-level answers, names, emails, and health information never go into the report. Work from the export, report aggregates.

## Workflow

1. **Inspect before cleaning.** Count rows, check the header against the survey, and look for test responses, staff responses, and blank rows.
2. **Clean and log every exclusion.** Remove duplicates (same respondent ID or email with the same wave; keep the first complete submission unless the user decides otherwise), speeders (completion time below a threshold; a common heuristic is under one-third of the median completion time, stated as a heuristic and adjusted to the survey's length), and partials (answered fewer than a stated share of the core items). Straight-lining (identical answers across a grid) is a flag to review, not an automatic exclusion. Read `references/cleaning-and-response.md`.
3. **Compute the response rate and describe who answered.** Response rate = usable responses / people invited x 100. Compare respondents with the invited group on anything known (site, role). If some groups answered much less, say which results may lean toward the groups that answered.
4. **Tabulate.** Run `scripts/survey_tabulate.py` (usage below) or tabulate by hand following the same rules. Single-choice items: counts and percentages. Likert items: the full distribution in scale order, the valid n, and top-2-box share (responses in the top two points / valid responses). Report a mean only for multi-item scales whose scoring guide says to average or sum items, or as a secondary figure beside the distribution when the user insists; explain why. Read `references/likert-and-prepost.md`.
5. **Compare pre and post correctly.** If responses are linked by a code, analyze matched pairs: count who moved up, stayed, or moved down, and compare top-2-box before and after among the same people. If they are not linked, the comparison is between two groups of respondents and is labeled "Unmatched comparison"; it cannot show that any individual changed. Never pool matched and unmatched responses in one change figure.
6. **Break down by group with suppression.** Crosstab by site, role, or other group only where each cell meets the threshold. Suppress cells below it, suppress a second cell when one hidden value could be recovered from a total, and fold small groups into "All respondents" or an "Other groups combined" row large enough to report. Write "fewer than N" for a suppressed group; never state its exact count.
7. **Code open-ended answers.** Build a short codebook (code, definition, include, exclude, paraphrased example), code all responses, count codes, and have a second person code a sample when the stakes justify it. Quote only short, de-identified phrases, and never quote a response that could identify someone or that discloses personal distress. Read `references/open-ended-coding.md`.
8. **Separate conclusions from limits.** Write what the data can support and what it cannot. Common limits: nonresponse, self-report, unmatched waves, small groups, no comparison group, and the survey measuring perceptions rather than behavior.
9. **Flag responses that need a human.** If an open-ended answer suggests someone may be at risk or discloses harm, do not analyze it further: tell the user it needs review under the organization's safeguarding procedure, and remove it from the analysis text.
10. **Write the plain-language summary last,** from the tables, in five sentences or fewer, with every number traceable to a table.

## Using the script

```
python3 scripts/survey_tabulate.py export.csv --likert Q1,Q2,Q3 --choice role --group site --min-cell 5
python3 scripts/survey_tabulate.py export.csv --likert Q1,Q2 --id-col email --duration-col seconds --min-seconds 60 --min-answered 0.5
python3 scripts/survey_tabulate.py export.csv --likert Q1,Q2 --wave-col wave --pair-col code --pre-label pre --post-label post
python3 scripts/survey_tabulate.py - --likert Q1 --scale "Never,Rarely,Sometimes,Often,Always" < export.csv
```

How to read it:

| Output | Meaning | How to use it |
|---|---|---|
| Cleaning summary | Rows read and removed at each step | Copy into the Cleaning log with the rule used for each step |
| `suppressed` | A count below the threshold, or a second cell hidden so the first cannot be recovered | Report as suppressed; do not back-calculate it |
| `<N` in the n column | A whole group below the threshold | Say "fewer than N respondents"; fold into a combined row |
| `off-scale or blank` | Answers that are blank or not on the scale (for example "Prefer not to say") | Excluded from the valid n; mention if large |
| `top-2-box` | Top two scale points / valid n | Headline figure for agreement items, always with the distribution |
| `all-or-none` | Every or no respondent in the group chose the top two | Check whether that reveals individual answers before reporting |
| Matched pre/post table | Change among people who answered both waves | Report the matched count; the McNemar exact p tests whether moves into and out of the top box are balanced, and says nothing about cause |

The script's suppression is standard primary and complementary suppression. It cannot rule out every inference across several tables; for sensitive items, report fewer breakdowns.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Plain-language summary
2. Cleaning log
3. Response rate and who answered
4. Results by question
5. Pre/post comparison
6. Results by group
7. Open-ended themes
8. What the data can tell us
9. What the data cannot tell us
10. Methods note

Use these exact labels where they apply: top-2-box, Matched pairs, Unmatched comparison, Suppression threshold:, suppressed, Assumed:.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

Do not use Markdown checkboxes.

1. **Plain-language summary** - up to five sentences for a non-technical reader.
2. **Cleaning log** - table: `Step | Rule | Responses removed | Responses remaining`.
3. **Response rate and who answered** - invited, usable responses, rate, and representativeness notes.
4. **Results by question** - for each item: distribution table in scale order, valid n, top-2-box.
5. **Pre/post comparison** - labeled either "Matched pairs" (with the matched count) or "Unmatched comparison" (with each wave's n).
6. **Results by group** - crosstabs with "Suppression threshold:" stated and suppressed cells marked "suppressed".
7. **Open-ended themes** - codebook summary table: `Code | Definition | Count | Share of respondents who commented | Example paraphrase`.
8. **What the data can tell us** - findings with the table each rests on.
9. **What the data cannot tell us** - limits and the claims to avoid.
10. **Methods note** - scale, exclusions, threshold, tests used, and assumptions labeled "Assumed:".

### Illustrative calculation (hypothetical)

100 people invited, 70 responses, 5 duplicates and 5 speeders removed: usable = 70 - 5 - 5 = 60; response rate = 60 / 100 = 60%. Of 60 valid answers, 20 Strongly agree and 25 Agree: top-2-box = 45 / 60 = 75%.

## Data handling

- Work on a copy of the export; never edit the original file.
- Before analysis, remove or ignore columns not needed for the report, such as names, emails, and free-text contact details. Keep an ID or linking code only for deduplication and matching.
- Do not paste raw rows into the report, chat summaries, or slides. Tables contain aggregates only.
- If the export includes student records or health information, flag that FERPA or HIPAA questions may apply and let counsel decide; do not share the file further until they do.
- Record the file name, export date, and filters used in the Methods note so the analysis can be repeated.

## Choosing breakdowns

| Question from the user | Breakdown | Check first |
|---|---|---|
| "Did some sites do better?" | Crosstab by site | Every site meets the threshold, or small sites are combined |
| "How did different groups experience it?" | Crosstab by role or identity group | Identity groups are often small; combine or report overall only |
| "Did it change over time?" | Pre/post, matched if linked | Linking method and matched count |
| "What did people say?" | Open-ended coding | Remove identifying or distress-related responses first |

## Common traps

- **A stakeholder asks for the average score per question.** Give distributions and top-2-box, explain in one sentence that averages hide how answers split on an ordered scale, and add a median if they still want one number.
- **Two anonymous waves presented as improvement.** Label the section "Unmatched comparison", report each wave's n, and describe the difference between respondent groups, not individual change.
- **A breakdown requested for a group below the threshold.** Report it as suppressed, fold it into a combined row, and check whether the remaining groups plus the total would reveal it; if so, suppress or combine a second group.
- **A request to state that the program improved mental health.** Replace with what was measured (knowledge, confidence, intentions, satisfaction) and list the claim under "What the data cannot tell us".
- **Speeders or duplicates left in.** Apply the cleaning rules before any tabulation and show them in the Cleaning log.
- **Percentages without denominators.** Every percentage carries its n, and respondent results are described as "among respondents".

## Plain-language summary pattern

1. Who answered: "X of Y invited people answered (Z%)."
2. The headline result with its denominator.
3. The most important difference or change, labeled matched or unmatched.
4. The main limit in one sentence.
5. The suggested next step.

## Quality checks

- Every number in the summary appears in a table; every percentage has its n.
- Exclusions are logged with rules; nothing was dropped silently.
- Likert items are reported as distributions with top-2-box; any mean is justified.
- Matched and unmatched pre/post results are labeled and never mixed.
- No cell or group below the threshold is shown, and no suppressed group's exact count appears anywhere, including in prose; write "fewer than N".
- No participant-level data, identifying quotes, or disclosures appear.
- Outcomes are stated as what was measured (knowledge, confidence, intentions, satisfaction), never as clinical or mental-health improvement, and never as caused by the program unless the design supports it.
- Language is people-first; say "died by suicide", never "committed suicide".

## Boundaries

- This skill analyzes survey data; it does not assess or triage individuals. Responses suggesting risk go to the organization's safeguarding procedure.
- Whether FERPA, HIPAA, or other rules apply to the data, and whether data can be shared with partners, is for the organization's counsel.
- It does not decide targets or what the organization reports externally; leadership approves claims.
- For question design use the survey-designer prompt; for planning the next evaluation use `design-program-evaluation`; for turning results into a logic model use `build-logic-model`.
