---
name: research-grant-prospects
description: Research and qualify grant funders for a nonprofit or mission-driven program - define the funding need, gather evidence from funder guidelines, IRS Form 990-PF grant lists, annual reports, peer organizations' funders and CRM history, score each prospect with a tunable weighted rubric (mission, population, geography, grant size, funding type, open or invitation only, recent giving, relationship path), and build a prospect pipeline with stages and next actions. Every funder fact is cited with source and date, and stale data is flagged. Use when asked to find foundations or corporate funders, build or clean a grant prospect list, read a 990-PF, rank funders by fit, decide which funders to approach this quarter, or plan cultivation before a letter of inquiry. Do not use for writing the proposal (write-grant-proposal), drafting a letter of inquiry (grant-letter-of-inquiry prompt), or individual donor segmentation and major-gift research.
---

# Research Grant Prospects

Prospect research decides where a development team spends its scarce hours. The common failure is a long list of famous foundations with no evidence that any of them funds this kind of work, in this place, at this size, from organizations they do not already know. This skill turns a funding need into a short, evidenced list: each prospect has cited facts, a fit score the user can tune, an honest read on whether the funder accepts unsolicited requests, and a next action in a pipeline. It never fills a gap with a guess about what a funder "probably" gives.

## Inputs to gather

Ask for these; label anything missing as **Assumed** and say what it affects.

- **The funding need**: program or general operating need, amount, period, start date, geography served, population served, and what the money would change. If this is vague, define it first (step 1); research without a need produces noise.
- **Organization facts**: annual budget, legal status (for example 501(c)(3) public charity), fiscal sponsor if any, service area, and past or current funders.
- **CRM history** (from the donor or grants database): past applications, awards, declines with reasons, contacts, board and staff connections, and last touch date.
- **Candidate funders** the user already has in mind, and any lists from peers, conferences, or consultants.
- **Constraints**: funders the organization will not accept money from (gift acceptance policy), capacity for applications this quarter, and reporting load it can carry.
- **Scoring preferences**: whether to change the default weights, and the budget share above which a grant becomes a concentration risk.
- **Staleness threshold**: how old a fact may be before it must be re-verified (default assumption 18 months).
- **Research access**: which directories or databases the user subscribes to, and whether the agent may retrieve funder websites and filed returns.

When the user cannot supply CRM history, proceed and mark the relationship criterion "Unknown" rather than scoring it zero.

## Workflow

1. **Define the funding need in one block.** Amount, period, type (general operating, project or program, capacity building, capital, or research), population, geography, outcomes, and the budget share. Write it as the "Funding need statement" before any search.
2. **Build the long list from evidence, not name recognition.** Use the sources in priority order below. Record where each name came from.
3. **Gather facts for each prospect.** Mission and priorities, geography, eligible organization types, funding types, typical grant size, application process, deadlines, and recent grants to comparable organizations. Enter each fact in the fact ledger with source, date of the source, and date retrieved. Read [references/sources-and-990pf.md](references/sources-and-990pf.md) for how to read a 990-PF and other sources.
4. **Flag stale and conflicting data.** A 990-PF is often one to two years old by the time it is public; guidelines change with new strategies. Mark any fact older than the user's staleness threshold (default assumption: 18 months from the source date) as "Stale - re-verify". When sources disagree, the funder's current website or program officer outranks a tax return, and a tax return outranks a third-party directory.
5. **Classify access.** For each prospect record "Open" (published process for unsolicited applications), "Invitation only" (the funder states it gives only to preselected organizations or by invitation), or "Unclear". A funder classed Invitation only is never scheduled for a letter of inquiry; it goes to cultivation with a relationship path.
6. **Score fit with the rubric.** Score each criterion 0 to 5 from cited facts; mark "Unknown" instead of guessing. Apply the weights and report the score with its evidence coverage. Read [references/fit-scoring-rubric.md](references/fit-scoring-rubric.md). Use `scripts/score_prospects.py` for more than a handful of prospects.
7. **Apply knockouts before ranking.** Outside the funder's geography, ineligible organization type, a stated exclusion that covers this work, or a conflict with the gift acceptance policy removes the prospect regardless of score.
8. **Map the relationship path.** For each qualified prospect, name the route in: existing program officer contact, board or staff connection, peer grantee introduction, public information session, or cold approach. Name the person who owns the next touch.
9. **Place each prospect in the pipeline** and set one dated next action. Read [references/pipeline-and-cultivation.md](references/pipeline-and-cultivation.md) for stage definitions and exit criteria.
10. **Check the portfolio.** Look at the qualified list as a whole: timing of deadlines against capacity, share of the need each could cover, concentration on one funder, and the mix of general operating and restricted money.

## Funding types defined

Match the need to the type the funder gives; a mismatch is the most common silent disqualifier.

- **General operating support**: unrestricted money for the organization's mission. Most flexible; often reserved for existing grantees.
- **Project or program support**: restricted to a defined program, with its own budget and outcomes.
- **Capacity building**: strengthens the organization itself (systems, staff skills, data, fundraising, technology).
- **Capital**: buildings, major equipment, or renovations.
- **Research or evaluation**: studies, surveys, or evaluation of a program.
- **Sponsorship or event support**: often from corporate marketing budgets rather than foundations, with different decision makers and benefits expected in return.
- **Employee-driven corporate giving**: matching gifts, volunteer grants, and employee campaigns; these follow the company's programme rules, not a proposal process.

## Sources in priority order

1. The funder's own current guidelines, request for proposals, FAQ, and strategy pages.
2. The funder's most recent IRS Form 990-PF (private foundations) or Form 990 Schedule I (public charities that make grants, such as community foundations), read for actual grants paid.
3. Annual reports and grants databases the funder publishes.
4. Peer organizations' annual reports, websites, and donor lists, which show who funds similar work nearby.
5. The organization's CRM history: prior applications, declines, and contacts.
6. Third-party directories and databases the user subscribes to; treat as leads to confirm, not as authoritative.
7. Program officer conversations, recorded with date and the person spoken to.

Do not state a funder fact without one of these sources. If a fact cannot be found, write "Not found" and the sources checked.

## Using the script

`scripts/score_prospects.py` applies the rubric to a CSV with one row per funder and one 0 to 5 column per criterion, plus access, an optional knockout reason, and the source date of the oldest fact used.

`python3 scripts/score_prospects.py prospects.csv --weights mission=25,relationship=5 --as-of 2026-01-15 --stale-months 18`

Read the output this way:

- **Score** is the weighted fit on known criteria only; **Cover%** is how much of the rubric had evidence. Treat any score with coverage under the minimum as "Research more".
- **Recommendation** already applies knockouts and the Invitation only rule; do not override it upward without a new fact.
- **Data age** shows "Stale - re-verify" when the oldest fact is older than the threshold. Re-verify before any submission.
- Change weights before scoring and state them in the answer; rerunning with different weights until a favourite rises is not tuning.

## Worked example (illustrative, hypothetical round numbers)

With default weights, a funder scored mission 5, population 4, geography 5, grant size 3, funding type 4, access open (5), recent giving 4, relationship 2 has a weighted score of (20 × 1.0 + 15 × 0.8 + 15 × 1.0 + 10 × 0.6 + 10 × 0.8 + 10 × 1.0 + 10 × 0.8 + 10 × 0.4) ÷ 100 × 100 = 83.0, with 100% coverage: "Pursue now". A second funder with the same facts but a checked "preselected organizations only" box on its return is "Watch" until a relationship path exists, whatever its score.

## Common failure patterns

- Listing large, well-known foundations because of their assets rather than their grants to comparable organizations.
- Treating a directory entry as a current fact without checking the funder's own materials.
- Sending letters of inquiry to funders that give only to preselected organizations.
- Asking for an amount several times the funder's median grant to comparable organizations.
- Scoring relationship as zero when it is simply unknown, which hides a research gap as a weak fit.
- Reading a board overlap on a return as a warm relationship before anyone has confirmed it.
- Building a pipeline with more applications than the team can write, so each is rushed.
- Predicting the chance of an award; the rubric ranks effort, it does not forecast decisions.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Funding need statement
2. Prospect fit scorecard
3. Fact ledger
4. Relationship path
5. Prospect pipeline
6. Removed prospects
7. Assumptions and gaps

Use these exact labels where they apply: "Evidence coverage", "Open", "Invitation only", "Unclear", "Current", "Stale - re-verify", "Conflicting", "Pursue now", "Cultivate first", "Research more", "Watch", "Remove".

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Use plain tables; do not use Markdown checkboxes.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Funding need statement**: amount, period, type, population, geography, outcomes, share of budget.
2. **Prospect fit scorecard**: funder, access (Open, Invitation only, or Unclear), mission, population, geography, grant size, funding type, recent giving, relationship, weighted score, evidence coverage, knockout, recommendation.
3. **Fact ledger**: funder, fact, source (document name and section or page), source date, retrieved date, status (Current, Stale - re-verify, or Conflicting).
4. **Relationship path**: funder, route in, person who owns it, first touch.
5. **Prospect pipeline**: funder, stage, next action, owner, due date, deadline if published.
6. **Removed prospects**: funder and the knockout reason, so nobody re-adds them next quarter.
7. **Assumptions and gaps**: what was assumed, what could not be found, and what the user should confirm.

Recommendation values: "Pursue now", "Cultivate first", "Research more", "Watch", or "Remove". A funder classed Invitation only with no relationship path is "Watch" at most. If the user asked for letters of inquiry to a list that includes a funder classed Invitation only, say plainly that no letter should go to that funder and give the cultivation step instead.

## Quality checks

- Every funder fact in the scorecard has a row in the fact ledger with a source and a source date.
- No award size, deadline, priority, or eligibility rule is invented or carried over from a different funder.
- Facts older than the threshold carry "Stale - re-verify".
- Invitation-only funders are not scheduled for a letter of inquiry or proposal.
- Unknown criteria are marked Unknown and excluded from the score denominator, with coverage reported.
- Grant size is compared with the funder's actual recent grants, not its asset size alone.
- The pipeline has one dated next action and an owner for every active prospect.
- No language promises or predicts an award.
- The weights used are stated, and any change from the defaults is explained.
- Every removed prospect has its knockout reason recorded.
- The pipeline fits the team's stated capacity for applications this quarter.
- Supplied facts, retrieved facts, and assumptions are visibly separate.

## Boundaries

- The skill ranks where to spend effort; it does not predict awards.
- It does not contact funders or submit anything.
- Donor-advised fund sponsors and corporate giving programs often disclose little; say so rather than filling gaps.
- Gift acceptance, conflicts of interest with board members, and restrictions tied to a funder's source of wealth are decisions for the organization's leadership and board under its own policies.
- Hand-offs: the letter of inquiry to the grant-letter-of-inquiry prompt, the full application to write-grant-proposal, the budget to build-grant-budget, and post-award reporting to write-funder-report.
