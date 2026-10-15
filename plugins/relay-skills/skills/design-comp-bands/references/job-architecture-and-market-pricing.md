# Job architecture and market pricing

## Job architecture is the prerequisite

A band is attached to a job at a level. If two people doing materially different work share a level, or the same work is leveled differently across teams, bands will look unfair no matter how good the market data is. Before pricing anything, confirm:

- **Job families**: groups of jobs with similar skills and career paths (for example, software engineering, product management, customer support, sales, finance). Some organizations add a higher grouping, often called a function.
- **Career tracks**: individual contributor and manager tracks, and possibly a support or technical track. The tracks may share a level numbering but should have separate definitions.
- **Levels**: a small number of levels with written, observable definitions (see design-career-ladder). Each level definition should be the same across families in scope, impact, and autonomy, even though the craft differs.
- **Job catalog**: every employee mapped to one family, track, and level, with a job code.

Signs the architecture is not ready: titles that do not map to levels, levels that differ by team, one level containing both new graduates and people with a decade of experience, or a family with a single level containing everyone.

## Sources of market data

Practitioners use several source types. Each has strengths and limits; the user must name the sources they actually have.

| Source type | Strengths | Limits |
|---|---|---|
| Purchased salary surveys from compensation data providers | Job descriptions and level definitions to match against, large samples, cuts by size, industry, geography | Cost, lag between collection and effective date, participant mix may differ from your labor market |
| Real-time compensation data platforms fed by customers' payroll systems | Fresher data, fine-grained levels | Participant mix skews to companies that use the platform; methods vary |
| Industry or association surveys | Specialized jobs | Small samples |
| Published pay ranges in job postings (where transparency laws require them) | Current, public | Ranges are often wide, may not reflect actual pay, titles are inconsistent |
| Self-reported salary websites | Easy to access | Unverified, self-selected, not suitable as a primary source |

Decision rule: use professionally collected survey data as the primary source; use postings and self-reported data only as a sense check, and label them.

## Matching jobs

Match on the content of the job and level, not the title.

1. Read the survey's job description and level definition.
2. Compare with the company's job: scope, responsibilities, reporting relationship, required expertise.
3. Rate match quality:
   - **Strong**: the survey job describes most of the company job's duties at the same level.
   - **Moderate**: the core is the same but scope or level differs somewhat; consider a documented adjustment.
   - **Weak**: only partial overlap. Use only if nothing better exists, and weight it low.
4. If a job is a hybrid of two survey jobs, some practitioners blend the two matches with stated weights; others price to the job it most resembles. Decision rule: blend only when both parts are substantial and regular parts of the job.
5. Record sample size. Many providers suppress cells with too few organizations or incumbents; when a cell is thin, move to a broader cut rather than relying on a small sample.

## Aging data to a common effective date

Survey data describes pay at the survey's effective date. Pay moves over time, so data from different surveys, or data used months after collection, must be moved to one common effective date (often the date the bands take effect, or the midpoint of the period they will be used).

- Aging factor (compound) = (1 + annual rate) ^ (elapsed years)
- Aging factor (simple) = 1 + annual rate × elapsed years
- Aged value = survey value × aging factor

The annual rate is a judgment the user supplies, typically based on salary increase budget surveys or observed movement in their own data. Do not supply a rate. Practitioners differ on compound versus simple aging; over periods under a year the difference is small. Decision rule: use one method consistently and state it.

Some teams age to a date part-way into the band's use period (for example, the midpoint of the plan year) so that bands are not already stale when half the year has passed. State the choice.

## Blending sources

When two or more surveys match a job, compute a weighted average of the aged values at the target percentile. Weights commonly reflect match quality, sample size, and how closely the survey's participants resemble the company's labor market. Document the weights. Do not average percentiles across different percentiles (for example, one survey's 50th with another's 75th).

## Choosing the pay philosophy

The pay philosophy states where the company intends to pay relative to its market. Common choices:

- **Market median (50th percentile)** for all roles.
- **Above median** (for example, 60th or 75th) for all roles, or only for hard-to-fill families.
- **Below median base, with higher variable pay or equity**, for companies that compete on total compensation.

Also define the market: which competitors for talent, what company size, which geographies. A company hiring nationally for remote roles and one hiring in one city need different cuts.

Present the tradeoff with the user's own numbers: the cost of the structure at each candidate percentile, and the current employee compa-ratios under each. Leadership decides.
