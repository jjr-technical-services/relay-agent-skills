---
name: report-communications-performance
description: Build a monthly communications performance report for a nonprofit or small team that starts from goals, defines every metric per channel with its formula and denominator (reach versus impressions, engagement rate, email open and click rates, conversions to donations, sign-ups, or registrations), compares periods with context, draws content-level insights, states attribution caveats, recommends what to do next month, and ends with a one-page leadership summary. Flags email opens as directional only because mail privacy features inflate them. Use when asked for a monthly or quarterly comms report, social media and newsletter metrics, email performance, channel results for the board or executive director, or what content worked. Do not use for a weekly team status update (weekly-status-update prompt), proving what marketing caused (measure-marketing-incrementality), or funnel drop-off analysis (diagnose-conversion-funnel).
license: MIT
---

# Report Communications Performance

Produce a monthly communications report that a busy leader can read in two minutes and
a communications lead can act on the next day. Most channel reports fail in the same
ways: they list every number the platforms export, compare rates computed on different
denominators, celebrate email open rates that privacy features have inflated, and credit
a channel with donations it merely touched last. This skill fixes the order (goals, then
definitions, then results, then insight, then action), makes every rate show its
formula and denominator, and keeps attribution claims honest.

## Inputs to gather

- **Goals** for the period and the year: what communications is meant to achieve
  (for example grow the family newsletter list, fill workshop registrations, support
  year-end giving, raise awareness among campus partners), each with a target if one
  exists. If none are supplied, ask; if still none, state proposed goals as assumptions.
- **Channel exports** for this period and the comparison period: email (delivered,
  unique opens, unique clicks, unsubscribes, bounces), each social platform (reach,
  impressions, engagements by type, link clicks, follower change), website (sessions,
  key page views, events), and conversion records (gifts, sign-ups, registrations)
  from the donation platform, forms, or CRM with their source fields.
- **Content list**: what was published, when, on which channel, and its topic or
  campaign tag.
- **Context**: campaigns, events, news, platform changes, list cleaning, send-volume
  changes, holidays, or anything unusual in either period.
- **Definitions in use**: how each platform defines engagement and reach, and how the
  email tool counts opens and clicks.
- **Privacy threshold**: the smallest count the organization will report for a
  subgroup (default assumption: do not break out groups under 10 people). Never include
  donor or participant names or contact details in the report.

Separate supplied numbers from estimates in every table. Label placeholders `TBD`.

## Workflow

1. **Start from goals.** List each goal, its metric, target, and owner. Every metric in
   the report must serve a goal; move the rest to an appendix or drop it.

2. **Define every metric before reporting it.** Read references/metric-definitions.md.
   For each channel, write the metric, its formula, its denominator, the data source,
   and known caveats. Keep the denominator the same across periods and platforms; if a
   platform only offers one denominator, say so rather than mixing.

3. **Compute results with explicit arithmetic.** Use `scripts/comms_metrics.py` when you
   have a CSV of channel counts. Report rates to one decimal place, and report change in
   rates as percentage points. Report change in counts as percent change with both raw
   values shown. Never present the relative change of a rate as its headline change.

4. **Put period-over-period change in context.** Read references/trends-and-attribution.md.
   Compare to the previous period and, where available, the same month last year.
   Before calling anything a trend, check: did the denominator change (list size, send
   volume, reach), did measurement change (privacy features, platform definitions,
   tracking), is the base small, and was there a one-off event.

5. **Treat email opens as directional only.** Mail privacy features, notably Apple Mail
   Privacy Protection introduced in 2021, preload images and register opens that may not
   be human reads. State this in the email section, use click rate as the primary
   engagement measure, and flag any case where opens rose while click-to-open rate fell.

6. **Find content-level insights.** Rank content by the metric tied to its goal, not by
   raw reach. Look for patterns by topic, format, time, and call to action, and state
   each insight with the evidence and its sample size. Mark single-post observations as
   hypotheses to test, not findings.

7. **State attribution caveats.** Conversions credited to a channel in a donation
   platform or analytics tool usually reflect a last-click or platform-specific rule,
   and gifts often follow several touches. Say which rule each number uses and what it
   cannot tell you. Do not say a channel caused, drove, or doubled anything without a
   test. When the question is whether a channel actually caused results, hand off to
   measure-marketing-incrementality.

8. **Recommend next month's actions.** Three to five specific actions, each tied to a
   goal and an insight, with an owner and how the report will show whether it worked.
   Include at least one measurement fix when a caveat blocked a conclusion.

9. **Write the leadership summary last**, on one page: goal status, three to five key
   results in plain words, what we learned, what we will do next month, and any decision
   or support needed. Read references/summary-layout.md for the layout.

## Using the script

`python3 scripts/comms_metrics.py data.csv --min-count 30` reads one row per channel per
period (columns listed in its `--help`) and prints each rate with formula and
denominator, the change in percentage points, and flags: `SMALL-BASE` (below the
threshold you set, so changes are likely noise), `OPENS-DIRECTIONAL`, `DENOMINATOR-FLIP`
(engagement rate moves in opposite directions on reach versus impressions, so report
both and explain), and `CTOR-DIVERGES` (opens up while click-to-open down, a sign of
inflated opens). The default threshold is an assumption; replace it with the
organization's own.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Leadership summary
2. Goals and status
3. Metric definitions
4. Results by channel
5. Content-level insights
6. Attribution caveats
7. Next month
8. Data notes

Use these exact labels where they apply: Denominator, directional only, Supplied, estimated, finding, hypothesis, percentage points.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

Write plain prose and tables. Do not use Markdown checkboxes or bracketed citations.

1. **Leadership summary** (one page, first in the document even though written last).
2. **Goals and status** (table): Goal | Metric | Target | Result | Status | Owner.
3. **Metric definitions** (table): Channel | Metric | Formula | Denominator | Source |
   Caveat. Email open rate carries the caveat "directional only".
4. **Results by channel** (table per channel): Metric | This period | Previous period |
   Change (percentage points for rates, percent for counts) | Supplied or estimated | Note.
5. **Content-level insights**: each insight with its evidence and sample size, marked
   finding or hypothesis.
6. **Attribution caveats**: the attribution rule behind each conversion number and what
   it cannot show; hand-off note to measure-marketing-incrementality when needed.
7. **Next month**: Action | Goal served | Owner | How we will know.
8. **Data notes**: sources, export dates, definitions changed, assumptions, TBD items.

## Quality checks

- Every metric appears in the Metric definitions table with formula and denominator.
- No rate is compared across platforms or periods on different denominators without
  saying so.
- Rate changes are in percentage points; relative percent is never the headline for a
  rate.
- Email open rate is labelled directional only; click rate is the primary email trend.
- Small bases are flagged, and no subgroup under the privacy threshold is broken out.
- No sentence claims a channel caused, drove, or doubled an outcome.
- Every recommendation ties to a goal and says how success will be measured.
- The leadership summary fits one page and contains no numbers that are not in the body.
- Supplied numbers and estimates are distinguishable in every table; all arithmetic is
  checked.

## Boundaries

- The report describes performance; it does not prove causation. Causal questions go to
  measure-marketing-incrementality, conversion drop-off to diagnose-conversion-funnel,
  and budget shifts to plan-marketing-budget.
- Donation figures in the report are communications views of the data; finance's
  records are authoritative for revenue.
- Do not include personal data about donors or program participants, and do not link
  program participation to donor records.
