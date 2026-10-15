---
name: plan-support-staffing
description: Calculate how many agents a customer support or contact center team needs from its workload. Forecasts contact volume by week, day and interval, sizes phone and chat with Erlang C against a service-level target, sizes email and ticket queues with workload hours and response-time targets, then applies occupancy caps and shrinkage to reach FTE, hires and sensitivity. Use when asked how many support agents or FTE to hire, for a support staffing model or headcount plan, to hit an 80/20 service level, to plan peak-season coverage, or to see what happens if handle time or ticket volume changes. Do not use for customer replies (support-reply-drafter), support SOPs (sop-writer), a company-wide budget (build-operating-budget), or process mapping (map-business-process).
---

# Plan Support Staffing

Turn a support team's workload into a defensible number of agents, interval by interval, and then into paid FTE and hires. The method is the one workforce-management practitioners use: forecast arrivals, convert them to workload, size real-time queues with queueing math (Erlang C) against an explicit service goal, size deferred work (email, tickets) with workload hours against a response-time goal, then gross up for the time agents are paid but not available. The answer is only as good as the forecast and the handle-time data, so every number is labelled as supplied, derived, or assumed, and the recommendation comes with its sensitivity.

## Inputs to gather

Ask for these. Proceed with clearly flagged placeholders only where the user cannot supply them, and say which result each placeholder drives.

- **Channels in scope** and whether each is real-time (phone, live chat, messaging with a live expectation) or deferred (email, web form, tickets, social queues).
- **Volume history**: at least 13 weeks of daily counts per channel, ideally 12 months or more to see seasonality, plus interval-level (15 or 30 minute) arrival counts for real-time channels. Note known events (launches, outages, billing runs, holidays).
- **Average handle time (AHT)** per channel: talk or chat time + hold + after-contact work, in seconds. Ask whether it is measured per contact or estimated.
- **Service goals**: for real-time, service level as "X% answered within Y seconds" and optionally an average speed of answer (ASA) limit; for deferred, first-response and resolution targets (for example, "90% of tickets get a first response within 8 business hours").
- **Hours of operation** and time zones covered.
- **Shrinkage**: paid time not available for contacts — breaks, meetings, training, coaching, absence, vacation, system downtime. Ask for the components, not one number.
- **Occupancy cap**: the highest share of logged-in time the team should spend handling contacts before burnout and quality suffer.
- **Chat concurrency**, if agents handle more than one chat at a time.
- **Deflection plans**: self-service, bots, product fixes that are expected to remove contacts. Treat as assumptions until measured.
- **Paid hours per FTE** per week and the current roster, attrition, and time-to-productivity for new hires.

When something is missing, state a placeholder in the form "Assumed: shrinkage 30% (placeholder — replace with your absence, training and meeting data)". Commonly used starting points exist for service level (80/20 is a frequent convention for voice), occupancy caps and shrinkage, but they are conventions, not benchmarks; always tell the user to replace them with their own policy and data.

## Workflow

1. **Frame the decision.** Establish what the number is for: next month's schedule, a quarterly hiring plan, a peak-season plan, or a budget line. The horizon decides the granularity (interval-level for scheduling, weekly/monthly for hiring).
2. **Clean the history.** Remove or tag anomalies (outages, one-off campaigns), separate channels, and note whether counts are offered contacts or only handled ones. Abandoned calls are demand; if only handled volume is available, flag that the forecast understates demand.
3. **Forecast volume.** Build the forecast top-down in layers: monthly or weekly level and trend, day-of-week pattern, then intraday interval distribution. Add known events and growth drivers (customer count, orders, releases). Read [references/forecasting-volume.md](references/forecasting-volume.md) when building or checking the forecast, and when deflection or growth assumptions are involved.
4. **Apply deflection explicitly.** Show volume before and after deflection as separate lines, with the deflection rate labelled as an assumption and its source (pilot result, vendor estimate, guess).
5. **Size real-time channels with Erlang C.** For each interval compute traffic intensity A = arrivals × AHT ÷ interval length (in Erlangs), then find the fewest agents N > A that meets the service level, then check the ASA limit and occupancy cap. Use `scripts/erlang_c.py` for this; read [references/erlang-c-real-time.md](references/erlang-c-real-time.md) for the formulas, the worked example, and when Erlang C misleads (abandonment, chat concurrency, small teams, blended work).
6. **Size deferred channels with workload hours.** Workload hours = volume × AHT ÷ 3,600, divided by productive hours per FTE, then checked against the response-time target and any backlog to burn down. Read [references/deferred-work-scheduling-and-sensitivity.md](references/deferred-work-scheduling-and-sensitivity.md) for this method, for turning requirements into schedules, and for the sensitivity table.
7. **Gross up for shrinkage.** Gross (scheduled) agents = net agents ÷ (1 − shrinkage). Do not multiply by (1 + shrinkage); that understates the need.
8. **Convert to FTE and hires.** Required paid hours per week ÷ paid hours per FTE = FTE. Add a schedule-efficiency allowance if shift patterns cannot match the interval curve exactly (label it). Compare with the current roster and adjust for expected attrition and ramp time to get the hiring plan and its timing.
9. **Run sensitivity.** Show how FTE moves with volume ±10–20%, AHT ±10%, shrinkage ±5 points, and deflection at zero versus plan. Identify the input the answer is most sensitive to and recommend how to measure it better.
10. **Recommend and state risks.** Give the headcount recommendation, the service level it buys, the hours or intervals that stay under target, and the assumptions that would change the answer.

## Running the Erlang C script

`scripts/erlang_c.py` uses only the Python standard library.

- One interval: `python3 scripts/erlang_c.py --calls 100 --aht 180 --interval-minutes 30 --sl-target 0.80 --sl-seconds 20 --max-occupancy 0.85 --shrinkage 0.30`
- Many intervals: `python3 scripts/erlang_c.py --csv intervals.csv --aht 180` where the CSV has a `calls` column and optional `interval` and `aht` columns. Add `--asa-target 30` for an ASA limit, `--concurrency 2` to approximate chat, and `--out results.csv` to save the table.

Interpret the output:

- `erlangs` is the workload in the interval; the team can never staff below it.
- `net_agents` is agents logged in and available; `gross_agents` adds shrinkage and is what the schedule must deliver.
- `binding` says which constraint set the number: service level, ASA, or the occupancy cap. If the cap binds, the team is large enough that queueing efficiency would push occupancy above a sustainable level.
- `service_level` above target is normal: agents come in whole units.
- Totals give net and gross agent-hours for the day or period entered; divide gross hours by paid hours per FTE for the period to get FTE.

Erlang C assumes nobody abandons and arrivals are random within the interval. Say so when presenting results, and see the reference for adjustments.

## Worked example (illustrative, hypothetical numbers)

A peak 30-minute interval has 100 calls at an AHT of 180 seconds, and the goal is 80% answered within 20 seconds.

- Traffic intensity A = 100 × 180 ÷ 1,800 = 10 Erlangs.
- 13 agents give a service level of 79.6% (just short); 14 agents give 88.8%, with ASA 7.8 seconds and occupancy 71.4%. Net requirement: 14.
- With 30% shrinkage (an assumption here), gross agents = 14 ÷ 0.70 = 20 for that interval.
- Deferred work in the same example: 1,000 tickets a week at 12 minutes = 200 workload hours. With 40 paid hours, 30% shrinkage and 85% productive utilization, each FTE gives 40 × 0.70 × 0.85 = 23.8 productive hours, so 200 ÷ 23.8 = 8.4 FTE before any deflection.

Use this to sanity-check the scale of a result, never as a benchmark for the user's team.

## Judgement calls and decision rules

Practitioners disagree on several points. Make the choice explicit and give the reason.

- **Erlang C versus Erlang A or simulation.** Use Erlang C when abandonment is low or unknown and a conservative answer is acceptable. Recommend Erlang A (which models caller patience) or discrete-event simulation when abandonment is material, when many skills and queues interact, or when the cost of over-staffing is large enough to justify the extra modelling.
- **Interval length.** Use 30-minute intervals by default; use 15-minute intervals when arrivals change sharply within the half hour or around known spikes.
- **Service level versus ASA.** Service level protects the typical customer's wait; ASA is an average that a few long waits can dominate. If the business cares about the worst experiences, report the share waiting longer than a limit as well as the average.
- **Occupancy cap.** A cap that is too high burns out agents and raises attrition and AHT; a cap that is too low wastes capacity. Treat the cap as a policy set with operations leadership, not a calculation output.
- **Deflection in the hiring plan.** Hire to the no-deflection or partial-deflection case until deflection is measured in production; release capacity later through attrition rather than hiring late.
- **Channel mix.** Moving contacts from phone to email lowers real-time staffing but changes response expectations and AHT. Model the shift as a scenario, not as a given.

## Handing off

- The resulting headcount and cost roll into the annual plan through build-operating-budget.
- If the plan exposes a process problem driving contact volume (repeat contacts, confusing billing), map it with map-business-process before assuming staffing is the fix.
- Measure the metric tree behind contacts per customer with kpi-tree when the user wants to manage demand rather than supply.

## Output

Deliver a staffing plan with these parts, in this order:

1. **Summary**: recommended FTE and hires by channel, the service goals they meet, and the one or two assumptions that matter most.
2. **Assumptions register** — table with columns: Input | Value | Source (supplied / derived / assumed) | Effect if wrong.
3. **Volume forecast** — table: Period | Channel | Forecast volume before deflection | Deflection assumption | Forecast volume after deflection.
4. **Real-time requirement** — table: Interval | Calls | AHT (s) | Erlangs | Net agents | Service level | ASA (s) | Occupancy | Binding constraint | Gross agents. Show the peak day in full and summarize other days.
5. **Deferred-work requirement** — table: Channel | Weekly volume | AHT (min) | Workload hours | Productive hours per FTE | FTE | Response-time check.
6. **FTE bridge** — net workload FTE → plus shrinkage → plus schedule-efficiency allowance → total FTE → current roster → gap → hires after attrition and ramp.
7. **Sensitivity** — table: Scenario | Changed input | FTE | Change vs. base.
8. **Scheduling implications**: peak intervals, shift shapes that fit the curve, coverage risks.
9. **Risks and next measurements**.

Keep the plan reproducible: every FTE figure should trace to a forecast row, an AHT, a service goal and a shrinkage value, each labelled supplied, derived or assumed. When data is partial, deliver the full structure with flagged placeholders and list the missing inputs first under risks.

Show ranges where the sensitivity shows the answer is not stable, and name the single measurement that would narrow the range most.

## Quality checks

Before answering, confirm:

- Traffic intensity used the same time unit for arrivals, AHT and interval (seconds with seconds).
- Every interval has N > A; no interval is staffed at or below its Erlangs.
- Shrinkage was applied by division, once, and not also buried in paid hours per FTE.
- Occupancy was checked against the cap in every interval, and the reported occupancy is A ÷ N.
- Deflection appears as a labelled assumption with before and after volumes, never silently netted out.
- Offered versus handled volume is stated; abandonment is acknowledged.
- Every number is marked supplied, derived, or assumed; no benchmark is stated as fact.
- The arithmetic in any illustrative example has been recomputed.
- The sensitivity table names the input that moves the answer most.
- Hiring dates allow for recruiting lead time and ramp to full productivity; new hires are not counted at full capacity on day one.
- Minimum staffing floors (nights, weekends, single-agent queues) are shown separately from the Erlang requirement.
- The FTE bridge adds up: net, gross, schedule allowance, total, roster, gap and hires reconcile line by line.
- Deferred-channel FTE was checked against the response-time target, not only the weekly workload.

## Boundaries

- This skill sizes workload. It does not set the service goal; that is a business decision about cost versus customer wait, and the plan should show the cost of each option rather than pick one silently.
- Labour law, scheduling rules, overtime, break entitlements and union agreements vary by jurisdiction; involve HR or employment counsel before finalizing schedules or changing shift rules.
- Outsourcing contracts priced per contact or per hour need procurement and legal review.
- Performance targets for individual agents (contacts per hour, AHT goals) are a management choice with quality risks; this skill uses AHT as an input and does not recommend pushing it down to fit a headcount number.
- Customer-facing commitments (published response times, contractual service levels) need sign-off from whoever owns the contract or policy before the plan relies on them.
- Budget roll-up of the resulting headcount belongs in build-operating-budget; replies to customers belong in support-reply-drafter; documenting support procedures belongs in sop-writer.
