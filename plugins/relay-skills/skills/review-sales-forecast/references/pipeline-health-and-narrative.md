# Pipeline health, the forecast call, and the narrative

## Slippage and pushes

```
Push rate (value) = value of deals due in period at period start whose close date later moved
                    to a future period / value due in period at period start
Repeat pushers    = open deals whose close date has moved out two or more times
Slipped value     = total value moved out of the period since the last review
```

- Compute push rate for the current period to date and for past periods at the same week, so the comparison is fair.
- List repeat pushers with each push date and reason. A deal with several pushes and no change in evidence is a candidate for pipeline or omitted, not commit.
- Pull-ins (deals moved into the period) matter too: sudden pull-ins near period end with no new evidence are a warning sign.
- Amount changes: track deals whose amount dropped (scope cut, discount) as well as date changes.

## Aging

```
Deal age              = snapshot date - created date
Days in current stage = snapshot date - date entered current stage
```

- Compare deal age with the typical cycle length of won deals (median, by segment) and days in stage with the typical stage duration for won deals.
- Flag deals beyond a threshold the team sets from its own distribution (for example, beyond the value that most won deals stayed under). Long-aged deals often close at lower rates, but verify with the user's data before weighting them down.
- Stale deals with no buyer activity for longer than the team's inactivity window go to omitted.

## Running the forecast call

A suggested agenda for a weekly call (adapt the timing to the team's size):

1. **Number first.** Closed to date, the call, the range, and the change since last week.
2. **Movement.** Deals that moved in and out of commit and best case, with reasons.
3. **Inspection.** The largest commit and best-case deals: evidence against the commit criteria, MEDDPICC gaps, next steps with dates.
4. **Risks and upside.** Specific actions, owners, and dates. Ask what help the rep needs (executive sponsor call, legal escalation, pricing approval).
5. **Hygiene.** Past close dates, missing next steps, stale deals, and the owners fixing them by the next call.
6. **Commitments.** Record each rep's commit and best-case number and the manager's call.

Keep the call about evidence and actions. A call that spends its time on re-telling deal stories without testing evidence produces the same forecast next week.

## Narrative template

Write for a reader who will not attend the call. Keep it short.

> **Call for [period]: [number] (range [low] to [high]).** Closed to date [value], [x] percent of target, week [w] of [n].
>
> **Change since last review:** [up/down] [value], driven by [specific deals or events].
>
> **Basis:** stage-weighted [value], historical conversion [value], rep and manager roll-up [value]. The call leans on [method] because [reason, ideally past accuracy].
>
> **Top risks:** [deal or event], [value], [what would change it, owner, date]. (Two to four items.)
>
> **Upside:** [deal], [value], [the event that would pull it in]. (Two to three items.)
>
> **Coverage and next period:** current-period coverage [x] against a required [y] derived from our in-period win rate of [z]; next-period pipeline at [value].
>
> **Asks:** [specific leadership help needed].

Every number in the narrative must appear in the supporting tables; the narrative adds interpretation, not new figures.

## Signs the forecast process itself needs work

- Forecast error is consistently in one direction (bias) for several periods.
- Commit changes by large amounts in the final weeks of most periods.
- Stage probabilities in the CRM have never been recalibrated against history.
- Many deals sit in commit without a verified economic buyer or mapped paper process.
- Categories mean different things to different managers.
