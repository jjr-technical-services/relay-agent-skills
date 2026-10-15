# Capacity and quota

## Ramped rep equivalents (RRE)

A new rep does not deliver full productivity on day one. Capacity must count ramped rep equivalents rather than heads.

```
Ramp factor(m) = share of full productivity in month m of tenure (from the ramp curve)
RRE for one rep over the plan year = sum over months in the year (ramp factor for that month) / 12
Total RRE = sum over all reps (RRE per rep) - expected attrition loss
Capacity = Total RRE x productivity per ramped rep
```

- **Productivity per ramped rep** is the average bookings a fully ramped rep actually delivered per year, from the user's history. It is not quota. Use the median or a trimmed mean if one or two reps distort the average, and say which.
- **Ramp curve**: derive it from the user's own cohort data (bookings by month of tenure for reps hired in the last two years). If there is none, use a placeholder and label it Assumed. Longer sales cycles mean longer ramps; a rep cannot close a deal faster than the cycle.
- **Attrition**: expected departures = starting headcount x annual attrition rate x share of year. Each departure loses the remaining months of that rep's capacity plus the vacancy period plus the replacement's ramp. A simple approximation assumes departures are spread evenly, so on average each departure loses half a year of a ramped rep.

### Illustrative example (hypothetical numbers)

Assumed ramp curve: months 1-3 at 0 percent, months 4-6 at 50 percent, month 7 onward at 100 percent.

- A hire starting in month 1 of the plan year: 3 x 0 + 3 x 0.5 + 6 x 1.0 = 7.5 ramped months, so 7.5 / 12 = 0.625 RRE.
- 10 existing ramped reps, assumed 20 percent annual attrition: 2 expected departures, each losing on average half a year, so an attrition loss of 1.0 RRE. Existing reps contribute 10 - 1.0 = 9.0 RRE (this simple version ignores backfill; add backfill hires explicitly if planned).
- 4 new hires starting in month 1: 4 x 0.625 = 2.5 RRE.
- Total RRE = 9.0 + 2.5 = 11.5.
- Assumed productivity per ramped rep = 1,000,000 per year. Capacity = 11.5 x 1,000,000 = 11,500,000.
- Finance target = 13,000,000. Gap = 13,000,000 - 11,500,000 = 1,500,000.

## Reconciling top-down and bottom-up

Top-down: the finance target, usually from the company plan. Bottom-up: capacity from the model above. They rarely match. Present the gap and size each lever:

| Lever | How to size it | Evidence required |
|---|---|---|
| Hire earlier | Recompute RRE with earlier start months | Recruiting lead time, hiring plan feasibility |
| More hires | Each month-1 hire adds its RRE x productivity | Budget, management span, enough potential to fill a new territory |
| Productivity improvement | Change productivity per RRE | A specific cause (price increase, better win rate, new product) with data behind it |
| Other channels | Partner or self-serve bookings outside rep capacity | Channel history |
| Lower the target | Finance decision | Not a sales-planning decision; escalate |

Do not close the gap by raising quotas without a matching capacity change. That produces low attainment, attrition, and a worse gap next year.

## Quota pool and over-assignment

Many companies set the sum of rep quotas above the company target so that under-attainment by some reps does not sink the plan. This is called over-assignment (or quota buffer).

```
Quota pool = company target x (1 + over-assignment)
```

Set over-assignment from the user's own attainment history: if the ramped team has historically delivered a given share of total assigned quota, the over-assignment needed is roughly (1 / that share) - 1. Illustration: if the team historically delivered 90 percent of assigned quota, 1 / 0.9 - 1 = 0.111, about 11 percent. Too much over-assignment makes quotas feel unattainable; report attainment implications.

Continuing the hypothetical example: with 10 percent over-assignment, the pool is 13,000,000 x 1.10 = 14,300,000. Divided by 11.5 RRE, the quota for a fully ramped rep is about 1,243,478, compared with historical productivity of 1,000,000. That is a 24 percent stretch over what an average ramped rep has delivered, and it signals the gap has leaked into quota. Flag it.

## Allocating quota to territories

```
Blended share_i = w x potential share_i + (1 - w) x historical share_i
Quota_i = quota pool x blended share_i
Ramped quota_i = Quota_i x ramp factor for the period
```

- Potential share rewards opportunity; historical share reflects proven demand. A weight w closer to 1 suits new or heavily redrawn territories; closer to 0 suits stable territories with reliable history. State w and why.
- Ramped quota for new hires should follow the same ramp curve used in capacity, or the pool will not reconcile.
- Check that the sum of the quotas actually assigned equals the pool (rounding aside). Ramping new hires makes the sum of ramped quotas fall below the pool; either allocate on (blended share_i x ramp factor_i), renormalised so the ramped quotas sum to the pool, or show the shortfall as uncovered quota. State which, because renormalising raises every ramped rep's quota.

## Quota-to-OTE sanity check

On-target earnings (OTE) is base salary plus variable pay at 100 percent attainment.

```
Quota-to-OTE multiple = annual quota / OTE
Rep cost of sales at 100% = OTE / annual quota
```

Illustration (hypothetical): OTE 250,000 and quota 1,250,000 gives a multiple of 5.0 and a rep cost of sales of 20 percent. Compare the multiple with the company's prior years, with the same role across segments, and with finance's cost-of-sales target. A multiple that moves sharply from last year, or that differs across similar roles, needs an explanation. Commonly quoted benchmark multiples vary by segment, deal size, and motion; do not present one as fact, and prefer the user's own history.
