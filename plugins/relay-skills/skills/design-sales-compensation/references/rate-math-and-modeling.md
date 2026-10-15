# Rate math and payout modelling

## Base commission rate

```
BCR = target variable pay for the measure / quota for the measure
```

With several measures, split target variable by weight first, then compute a BCR per measure.

Illustration (hypothetical): OTE 200,000 with an even mix gives base 100,000 and target variable 100,000. Quota 1,000,000. BCR = 100,000 / 1,000,000 = 10 percent.

## Tiers: thresholds, decelerators, accelerators

A tiered plan applies different rates to bookings in different attainment bands.

```
Tier rate = BCR x multiplier
Payout = sum over tiers (bookings falling in the tier x tier rate)
```

- **Threshold:** an attainment level below which no commission (or a reduced rate) is paid. It stops paying for business that would arrive with little effort. Set it from history: the attainment level most reps reach even in a weak period.
- **Decelerator:** a lower-than-BCR rate below a set attainment. It has the same purpose as a threshold with a softer edge.
- **Accelerator:** a higher-than-BCR rate above 100 percent. It rewards overachievement and keeps top performers selling late in the period.
- **Recalibration:** any reduced rate below 100 percent must be offset by a higher rate elsewhere below 100 percent so that payout at exactly 100 percent equals target variable. Check:

```
sum over tiers up to 100% (band width x multiplier) = 1.0
```

### Illustrative tier design (hypothetical numbers, continuing the example)

| Band (attainment) | Multiplier | Rate |
|---|---|---|
| 0 to 50% | 0.5 | 5% |
| 50 to 100% | 1.5 | 15% |
| Above 100% | 2.0 | 20% |

Check at 100 percent: 0.5 x 0.5 + 0.5 x 1.5 = 0.25 + 0.75 = 1.0. Correct.

Payout table:

| Attainment | Bookings | Variable payout | % of target variable | Total earnings | Cost of sales |
|---|---|---|---|---|---|
| 50% | 500,000 | 25,000 | 25% | 125,000 | 25.0% |
| 80% | 800,000 | 70,000 | 70% | 170,000 | 21.25% |
| 100% | 1,000,000 | 100,000 | 100% | 200,000 | 20.0% |
| 120% | 1,200,000 | 140,000 | 140% | 240,000 | 20.0% |
| 150% | 1,500,000 | 200,000 | 200% | 300,000 | 20.0% |

Workings: at 80 percent, 500,000 x 5% = 25,000 plus 300,000 x 15% = 45,000, total 70,000. At 120 percent, 100,000 plus 200,000 x 20% = 40,000, total 140,000. At 150 percent, 100,000 plus 500,000 x 20% = 100,000, total 200,000. Cost of sales = total earnings / bookings.

Read the table: the rep at 50 percent earns 125,000, well below OTE, which is the intent. Above 100 percent, the marginal rate (20 percent) equals the average cost at 100 percent, so the cost of sales stays flat; a steeper accelerator would raise it.

## Caps and why to avoid them

A cap limits total variable payout. Caps protect the company from windfalls but tell the best sellers to stop selling once they reach it, push deals into the next period, and signal distrust. Alternatives that address the real concern:

- **Large-deal review clause:** deals above a defined size are reviewed and may be paid on a different schedule or rate, defined in the plan in advance.
- **Declining accelerator at very high attainment** rather than a hard stop.
- **Better quota setting**, since most windfalls come from quotas set without regard to account potential.

If a cap is used, state the level, the reason, and the expected number of reps affected based on history.

## SPIFFs

A SPIFF (sales performance incentive fund) is a short, specific bonus for a defined behaviour, for example the first sales of a new product during a launch quarter.

- Fixed start and end dates, a specific qualifying event, a defined budget.
- Should not pay for behaviour the core plan already pays for, or reps learn to wait for SPIFFs.
- Track cost and results; stop SPIFFs that did not change behaviour.

## Clawbacks

A clawback recovers commission already paid when the underlying revenue does not materialise, for example cancellation or non-payment within a defined window after booking.

- Define triggers, the window, the amount recovered (full or prorated), and the recovery method (offset against future commissions is typical).
- Many jurisdictions restrict deductions from wages and recovery of earned commissions. Define when commission is earned so that clawbacks apply only before it is earned where required. Always involve employment counsel.

## Cost of sales check

```
Rep cost of sales at attainment a = (base + variable payout(a)) / (quota x a)
Expected variable cost = sum over reps (variable payout at that rep's expected attainment)
Plan cost of sales = (total base + expected variable cost) / expected total bookings
```

Use the historical attainment distribution by role, not a single average: because payout curves are non-linear, the payout at average attainment is not the average payout. Compare the plan cost of sales with finance's target and with the current plan's actual cost.

## Payout modelling checklist

1. Payout at 50, 80, 100, 120, and 150 percent attainment for every role.
2. Payout at the historical distribution, giving total expected cost.
3. A downside case (lower attainment) and an upside case (higher attainment), with total cost for each.
4. Top-performer check: what the best rep from last period would have earned under the new plan compared with the old.
5. Transition check: which reps would earn materially less at the same performance, with reasons.
