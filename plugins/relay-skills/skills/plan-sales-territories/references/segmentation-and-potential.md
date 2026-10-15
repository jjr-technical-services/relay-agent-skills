# Segmentation and account potential

## Clean the account universe first

Most territory disputes trace back to a dirty account list. Before segmenting:

1. **Resolve hierarchy.** Decide whether ownership sits at the global parent, the regional subsidiary, or the site. Write the rule down (for example, "the parent owner owns every child unless a child has its own buying centre and budget"). Apply it before counting.
2. **Deduplicate.** Merge duplicate records by domain and legal name. Count how many were merged; a large number means the potential totals from last year were inflated.
3. **Remove what no rep should own.** Accounts outside the ideal customer profile, accounts owned by partners or resellers, government or regulated accounts that need a specialist team, and accounts marked do-not-contact.
4. **Measure field completeness.** Report the share of accounts missing industry, employee count, or location. Missing fields push accounts into a default segment and quietly unbalance it.
5. **Freeze a snapshot.** Plan on a dated extract so balance numbers do not shift while people argue about them.

## Segmentation options and when to use each

| Model | How ownership is defined | Use when | Watch for |
|---|---|---|---|
| Named accounts | An explicit list per rep | A small number of large accounts drive most potential and need deep, multi-threaded coverage | Lists drift; unlisted subsidiaries become orphans. Review the list every period. |
| Geographic | Region, state, postcode, or drive-time polygon | Field selling, in-person meetings, local partners, or time-zone coverage matter | Dense metros hold most potential; pure geography rarely balances without splitting cities. |
| Vertical (industry) | Industry code or use-case family | Buyers expect domain knowledge, the product has industry-specific features, or references are industry-specific | Industry codes are often wrong; validate a sample before relying on them. |
| Employee or revenue band | Company size bands | Deal size, cycle length, and buying process differ sharply by size, so motions differ (inside versus field, transactional versus enterprise) | Band thresholds are arbitrary; test several cut points against deal size and cycle length. |
| Hybrid | Size band first, then geography or vertical within the band | Most mid-size and larger teams | Too many layers produce territories no one can explain. Keep to two levels where possible. |

**Decision rule.** Choose the primary cut that best separates sales motions: look at historical average deal size, sales cycle length, win rate, and selling channel by candidate segment. If two candidate segments show similar values on all four, merge them. If a segment shows a clearly different motion, it deserves its own reps. Then choose the secondary cut by what drives coverage cost: geography when travel or time zones matter, vertical when domain expertise changes win rates.

## Account potential

Potential is what an account could reasonably buy over the planning horizon. It is not a forecast. Two families of method exist; practitioners disagree about which is better, so pick using the rule below.

### Method A: addressable spend

```
Addressable spend = units the account could use x expected price per unit
Potential = Addressable spend x (1 - share already captured) x propensity
```

- *Units* come from a driver tied to how the product is priced: seats (employees in the relevant function), sites, transaction volume, or revenue.
- *Share already captured* is current ARR divided by addressable spend for existing customers (this is the whitespace).
- *Propensity* is a probability-like factor from 0 to 1 based on fit and intent signals. Calibrate it against historical win rates by segment rather than guessing.

### Method B: weighted fit score

```
Score = sum over factors (weight_f x normalised value_f)
```

Factors might include size band, industry fit, technology in use, growth signals, and engagement. Normalise each factor to 0-1 (min-max or rank), and make weights sum to 1.

### Choosing

- Use Method A when you can name a pricing driver and estimate it for most accounts. It produces currency, which you can add up, compare with the plan target, and use to allocate quota.
- Use Method B when drivers are unavailable or unreliable. It ranks accounts but cannot be summed into a currency pool, so convert it before allocating quota (for example, map score deciles to the average first-year deal size observed in each decile).
- In both cases **calibrate against history**: sort last year's accounts by the score they would have received, split into deciles, and check that win rate and average deal size rise with the score. If they do not, the weights are wrong. Report this check.

### Illustrative example (hypothetical numbers)

A product priced per seat at an assumed 1,000 per seat per year. An account with 400 employees in the relevant function has addressable spend of 400 x 1,000 = 400,000. It already pays 100,000, so whitespace is 300,000 (share captured 25 percent). With a calibrated propensity of 0.3, potential is 300,000 x 0.3 = 90,000.

## Workload

```
Workload hours = sum over accounts (hours per year for that account's tier)
Workload index = territory workload / mean territory workload x 100
```

Estimate hours per tier from activity data (meetings, calls, emails converted to time) or from rep time studies. Compare with selling hours available: working days x hours per day x share of time actually spent selling. The selling share is a key assumption; measure it rather than assume it.
