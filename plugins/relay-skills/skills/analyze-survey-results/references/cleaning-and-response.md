# Cleaning and response

## Order of cleaning steps

Apply in this order and log each step with its rule and count, so anyone can reproduce the numbers.

1. **Remove test and staff responses** (by date before launch, a test flag, or staff emails), if the user confirms.
2. **Remove duplicates.** Same respondent ID, email, or linking code within the same wave. Keep the first complete submission by default; if the user prefers the last (for example, people corrected answers), note the rule.
3. **Remove speeders.** Responses completed too fast to have read the questions. A commonly used heuristic flags completion times under about one-third of the median; for a short survey, set a floor from how long a careful read takes (for example, count items and allow a few seconds each). Present the threshold as a choice, not a standard.
4. **Remove or keep partials.** Define a completion rule, such as answering at least half of the core items. Keep partial responses for the items they answered when the survey tool records answers item by item and the user agrees; otherwise remove them. State which.
5. **Review straight-lining.** Identical answers across a grid of items, especially with reversed items, can signal inattention. Flag for review; remove only with a stated rule.
6. **Standardize answers.** Trim spaces, unify capitalization, map variant labels to the scale, and separate "Prefer not to say" and "Not applicable" from scale points.

## Response rate

Response rate = usable responses / people invited (or eligible) x 100.

- State both numbers. "68 of 140 attendees (49%)" is clearer than "49%".
- If the invited count is unknown (for example, an open link), report counts and say the rate is unknown.
- Formal definitions exist for survey research (the American Association for Public Opinion Research publishes standard response-rate formulas); for program surveys, the simple formula above, with the rule stated, is usually enough.

## Nonresponse

People who answer can differ from those who do not; program surveys tend to hear more from engaged participants. Cautions to include:

- Compare respondents with the invited group on known characteristics (site, role, attendance). Name groups that are underrepresented.
- Avoid presenting respondent percentages as "participants" percentages without the response rate.
- Low response is not automatically fatal, but results should be described as "among respondents".
- Weighting to correct for nonresponse is possible when group sizes are known, but adds complexity; for small program surveys, reporting by group (where cells allow) is usually clearer.

## Small groups and suppression

- Use the organization's threshold. If none, assume 10 and label it.
- Primary suppression: hide any cell with a count from 1 to threshold - 1.
- Complementary suppression: if a row or column total is shown and only one cell in it is hidden, hide another so the value cannot be subtracted out.
- Group suppression: a group below the threshold is not shown; combine it with other small groups or leave it in the overall total only. If only one group is hidden and the total is shown, the hidden group can be recovered by subtraction, so hide or combine a second group too.
- Zero counts can usually be shown, but 0% or 100% in a small group reveals every member's answer; check before reporting.
- Never state a suppressed group's exact size in prose ("the 3 respondents from..."). Write "fewer than 10 respondents".
