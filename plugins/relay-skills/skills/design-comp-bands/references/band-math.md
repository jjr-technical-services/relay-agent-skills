# Band math: midpoints, spread, progression, overlap, and differentials

## Definitions and formulas

| Term | Definition | Formula |
|---|---|---|
| Midpoint | The reference rate for a fully proficient person in the job at that level; usually set at the market reference for the chosen percentile | market reference × (1 + any philosophy premium) |
| Range spread | Width of the range relative to its minimum | (max − min) ÷ min |
| Minimum from midpoint and spread | Lowest pay in range, with midpoint centred | min = 2 × midpoint ÷ (2 + spread) |
| Maximum | Highest pay in range | max = min × (1 + spread) |
| Midpoint progression | Step between midpoints of adjacent levels | (mid of higher level − mid of lower level) ÷ mid of lower level |
| Overlap | Share of the lower level's range that is also inside the higher level's range | (max of lower − min of higher) ÷ (max of lower − min of lower), floored at 0 |
| Compa-ratio | Pay relative to midpoint | salary ÷ midpoint |
| Range penetration | Position within the range | (salary − min) ÷ (max − min) |

Note on definitions: most compensation practice measures range spread from the minimum, as above. Some organizations express width relative to the midpoint ("plus or minus 20% of midpoint"). A range of midpoint ±20% has min = 0.8 × mid and max = 1.2 × mid, so spread from the minimum = 0.4 ÷ 0.8 = 50%. State which convention is used to avoid confusion.

## Setting midpoints

1. Start from the blended market reference at the target percentile for each benchmark job and level.
2. Plot midpoints by level within each family. Market data is noisy; the raw values often zig-zag.
3. Smooth them so progression between levels is consistent. Common approaches: fit a constant percentage progression between levels, or use a line of best fit on the logarithm of market values. Document any midpoint that departs from the market reference by more than a threshold the user sets.
4. For jobs without market matches, slot them into the structure by comparing their level definition with benchmarked jobs (internal equity).

Decision rule on one structure versus several: if families have materially different markets (engineering and customer support often do), use separate structures by family or family group. A single structure across very different markets will overpay some jobs and underpay others.

## Choosing range spread

Spread reflects how much pay variation is reasonable for the level: the time it takes to grow from entry to full mastery, and how much individual contribution varies. Common practice is narrower spreads at entry levels and wider spreads at senior and executive levels, because senior roles vary more in scope and take longer to master. A commonly used starting heuristic is a spread in the region of 30–40% for entry and early-career levels, rising to 50–60% or more for senior and executive levels. Treat these as a starting point to test, not a standard, and replace them with what the company's own pay distribution and time-to-proficiency support. Decision rule: choose the narrowest spread that still covers legitimate differences in proficiency within the level, and check it against the actual pay distribution of current employees.

Too narrow: people hit the maximum quickly, forcing promotions or red-circles. Too wide: the range provides little guidance, and pay for the same work can differ enough to create equity risk.

## Midpoint progression and overlap

With the same spread s at two adjacent levels and midpoint progression p, the overlap simplifies to (s − p) ÷ s.

- Illustrative: s = 50%, p = 15% gives overlap (0.50 − 0.15) ÷ 0.50 = 70%.
- If p is small relative to s, overlap is high: a strong performer at the lower level may be paid more than a new person at the higher level. Some overlap is normal and intended.
- If p approaches s, overlap disappears and promotions produce very large increases.
- If p exceeds s, there is a gap between ranges.

Decision rule: pick progression so that a typical promotion moves someone to around the lower part of the next range without a cut and without a jump the budget cannot support; then check overlap. Very high overlap across several levels suggests too many levels or ranges that are too wide.

## Geographic differentials

Two approaches:

1. **Location tiers**: group locations into a few tiers by labor-market pay level, and set each tier as a percentage of a reference structure (for example, tier 1 = 100%, tier 2 = 90%). Differentials must come from market data for each location, not a cost-of-living index; labor markets and living costs differ.
2. **Separate structures** per country or major market, built from local market data. Required across countries with different currencies and pay practices.

State how remote employees are placed (by their location, by the office they are attached to, or by a single national rate) and what happens when someone moves. These are policy choices with retention and fairness consequences; leadership decides.

## Worked check (illustrative)

Level 3 midpoint 100,000, spread 50%: min 80,000, max 120,000. Level 4 midpoint 115,000, spread 50%: min 92,000, max 138,000.

- Progression = 15,000 ÷ 100,000 = 15%.
- Overlap = (120,000 − 92,000) ÷ (120,000 − 80,000) = 28,000 ÷ 40,000 = 70%. Same as (0.50 − 0.15) ÷ 0.50.
- A tier-2 location at 90% of reference would run Level 3 from 72,000 to 108,000 with midpoint 90,000.

## Other structure types

- **Broadbands**: few, very wide bands covering several traditional levels. Flexible, but give little guidance and make equity harder to defend.
- **Step structures**: fixed steps within a range, common in public sector and unionized settings; progression by time or review.
- **Market-based ranges per job**: each job priced independently rather than fitted to a grade structure. Accurate for each job, harder to administer and to compare across families.

Decision rule: a growing company with a clear level framework usually benefits from ranges by family and level; choose broadbands or steps only when the organization's constraints call for them.
