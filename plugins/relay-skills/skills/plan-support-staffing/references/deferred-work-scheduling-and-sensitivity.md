# Deferred work, the FTE bridge, scheduling, and sensitivity

## Deferred channels: the workload-hours method

Email, web forms and tickets do not need to be answered in seconds, so a queueing model is the wrong tool unless the response target is very short. Use workload hours.

```
Workload hours per week   = weekly volume × AHT (minutes) ÷ 60
Productive hours per FTE  = paid hours per week × (1 − shrinkage) × productive utilization
Required FTE              = workload hours ÷ productive hours per FTE
```

Productive utilization is the share of available time actually spent on tickets (switching, research, and waiting on others reduce it). It is a policy assumption like the occupancy cap; label it.

Illustrative (hypothetical round numbers): 1,000 tickets a week at 12 minutes each = 1,000 × 12 ÷ 60 = 200 workload hours. With 40 paid hours, 30% shrinkage, and 85% utilization, productive hours per FTE = 40 × 0.70 × 0.85 = 23.8. Required FTE = 200 ÷ 23.8 = 8.4.

Count contacts, not tickets, if a ticket involves several agent touches: AHT should be total agent time per ticket across all touches, or volume should be touches with per-touch time. Mixing the two double-counts or undercounts.

### Response-time check

Workload hours say whether the week's work fits; they do not say whether it is answered in time. Check the target:

- **Target longer than a shift (for example 24 business hours):** the weekly or daily workload method is enough, provided staffing each day at least covers that day's arrivals so the backlog does not age past the target.
- **Target of a few hours:** check hourly or by half-day: arrivals in each window must be workable within the target by the agents on shift. Build an hourly arrival curve and compare with hourly capacity (agents on shift × 60 ÷ AHT minutes × utilization).
- **Target under about an hour:** the channel behaves like a real-time queue. Size it with Erlang C using the response target as the threshold T, and note the approximation.

### Backlog burn-down

If a backlog exists, add temporary capacity on top of steady-state need:

```
Extra FTE = backlog items × AHT (minutes) ÷ 60 ÷ weeks to clear ÷ productive hours per FTE
```

Illustrative: 600 backlog tickets × 12 minutes ÷ 60 = 120 hours; cleared over 4 weeks = 30 hours per week; ÷ 23.8 = 1.26 extra FTE for those four weeks. This is often better met with overtime or temporary help than with permanent hires.

## The FTE bridge

Lay the arithmetic out so each step is checkable:

| Step | Formula | Note |
|---|---|---|
| Net requirement | From Erlang C (real-time) and workload hours (deferred) | Agent-hours or FTE on productive work |
| Gross requirement | Net ÷ (1 − shrinkage) | Divide, do not multiply by (1 + shrinkage) |
| Schedule-efficiency allowance | Gross ÷ schedule efficiency | Shift patterns cannot match every interval; label the assumption |
| Total FTE | Required paid hours ÷ paid hours per FTE | Use the same week length for every channel |
| Gap | Total FTE − current productive roster | Count ramping hires at partial capacity |
| Hires | Gap + expected attrition over the lead time | Start hiring lead time + ramp time before the need |

Apply shrinkage exactly once. If the workload-hours method already used productive hours per FTE that include shrinkage, do not gross up again.

Shrinkage is best built from components so it can be managed: planned (vacation, holidays, training, team meetings, coaching, breaks) and unplanned (sick leave, unplanned absence, system outages). It varies by month; vacation-heavy months need more gross staff for the same net.

## Scheduling implications

- Compare the interval requirement curve with feasible shift patterns (start times, lengths, breaks, days off). The sum of scheduled agents per interval should meet or exceed the gross requirement in each interval; the excess is schedule inefficiency.
- Peaks shorter than a shift are cheaper to cover with part-time shifts, split shifts, staggered starts, or moving deferred work out of the peak than with full-time hires.
- Place breaks, meetings and training in the troughs of the intraday curve.
- Multi-skilled agents can absorb peaks across queues but lower each queue's predictability; model them explicitly if they are a large share of the team.
- Weekend and after-hours coverage often needs a minimum staffing floor that exceeds the Erlang requirement; show the floor separately so its cost is visible.
- Local rules on working time, rest periods, and overtime constrain schedules; confirm them with HR before publishing.

## Sensitivity

Recompute the requirement for each changed input, one at a time, and present:

| Scenario | Changed input | FTE | Change vs. base |
|---|---|---|---|
| Base | — | — | — |
| Volume +15% | Forecast volume | — | — |
| Volume −10% | Forecast volume | — | — |
| AHT +10% | Handle time | — | — |
| Shrinkage +5 points | Shrinkage | — | — |
| No deflection | Deflection set to zero | — | — |
| Service goal changed | For example 80/20 to 90/20 | — | — |

For workload-hours channels, FTE moves proportionally with volume and AHT. For Erlang C channels it moves less than proportionally with volume (pooling), and service level falls sharply when staffing slips just below requirement. Call out which input the plan is most exposed to and propose how to measure it better (for example, time-study AHT by contact type, or run a deflection pilot before counting it).
