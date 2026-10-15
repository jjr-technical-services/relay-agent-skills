---
name: design-career-ladder
description: Design a career ladder (leveling framework) for a job family. Sets individual contributor and manager tracks, the number of levels, and the dimensions that define them (scope, impact, complexity, autonomy, leadership and influence, craft), then writes observable level expectations that differ in kind between adjacent levels. Calibrates the draft against real anonymized examples, maps existing employees to levels, defines the promotion process and evidence standard, and links levels to salary bands. Use when asked to create or fix a career ladder, career framework, leveling guide, IC versus manager tracks, or promotion criteria, or when titles and levels are inconsistent across teams. Do not use for writing a single job description (job-description-writer), drafting an individual performance review (performance-review-draft), or pricing levels in pay ranges (design-comp-bands).
---

# Design Career Ladder

A career ladder defines what each level of a job family expects, in terms concrete enough that a manager, an employee, and a promotion committee reading the same evidence reach the same conclusion. It is the foundation for hiring levels, promotion decisions, and pay bands. The common failure is a ladder of adjectives: "demonstrates strong ownership" at one level and "demonstrates very strong ownership" at the next. That ladder cannot be applied consistently, so decisions default to who argues best. This skill builds ladders where each level differs from its neighbors in the kind of work and the scope of impact, tested against real anonymized examples before anyone is mapped to it.

## Inputs to gather

- **Job family and scope**: which roles the ladder covers (for example, software engineering, customer success, sales), and whether it must align with ladders in other families.
- **Organization context**: headcount in the family now and planned in two years, company stage, and how work is organized (product teams, regions, accounts).
- **Current state**: existing titles, levels, and any existing framework; where people think it fails.
- **Examples of real work**: anonymized descriptions of work by people widely regarded as performing solidly at different levels. These are essential for calibration. If none are provided, draft with placeholder expectations and mark the ladder "uncalibrated".
- **Decision makers**: who approves the ladder, who will sit on calibration and promotion panels.
- **Links**: whether salary bands exist or will be built (design-comp-bands), and the performance review cycle.

Label anything assumed. Never invent example employees or claim a level definition reflects another company's published ladder.

## Workflow

1. **Decide the tracks.** Most knowledge-work families need an individual contributor (IC) track and a manager track that branch at a defined level, with equivalent levels paid in the same bands. Read `references/structure-and-dimensions.md` for track design and when a single track is enough.
2. **Decide the number of levels.** Enough that each level represents a distinct, observable step in scope, and few enough that each level has meaningful room to grow. Test: can you describe work that clearly belongs at level N and not at N−1 or N+1? If not, merge levels.
3. **Choose the dimensions.** Pick four to six dimensions that matter for the family. A common set: scope, impact, complexity, autonomy, leadership and influence, and craft (functional expertise). Define each dimension in one sentence so every level uses it the same way.
4. **Write level expectations.** For each level and dimension, write observable behaviors and outcomes. Adjacent levels must differ in kind (what someone does, for whom, at what scope) not only in degree words. Read `references/writing-level-expectations.md` for the rules and patterns.
5. **Calibrate against real examples.** Place anonymized examples of real work against the draft. Where reviewers disagree about the level of an example, the wording is ambiguous; rewrite it. Repeat until independent reviewers agree on most examples. Read `references/calibration-mapping-and-promotion.md`.
6. **Map existing employees.** Managers propose a level for each person with evidence against the ladder; a calibration panel reviews across teams. Separate the mapping from pay changes and communicate the process before results.
7. **Define the promotion process.** State the evidence required, who nominates, who decides, timing, and how feedback is given when a case is not approved. Promotion is recognition of sustained work at the next level, not a reward for tenure.
8. **Link to pay.** Each level maps to one salary band per family and location; IC and manager levels at the same number share a band. Hand off to design-comp-bands for pricing.
9. **Plan rollout and maintenance.** Train managers, publish the ladder, set a review cycle, and name the owner.

## Level count heuristic

A commonly used heuristic: define the levels that people occupy today, plus one level above the most senior person, and defer the rest. Levels with nobody in them and no near-term hiring plan should be deferred, not defined, because untested definitions tend to be vague. A small family usually needs fewer levels than a large one, and more levels are usually needed at the senior end as the organization grows. Replace this heuristic with the organization's own evidence of distinct work.

Signs there are too many levels: promotions feel routine and happen on a timetable, managers cannot explain the difference between two adjacent levels, or the definitions start repeating each other. Signs there are too few: people wait years without recognition, or one level holds people whose scope differs dramatically.

## Worked example (illustrative)

Dimension: scope. Software engineering, IC track.

| Level | Expectation (scope) |
|---|---|
| IC2 | Delivers well-defined tasks within a feature, with design chosen by others. |
| IC3 | Owns a feature from design through release, choosing the approach within the team's architecture. |
| IC4 | Owns a system or problem area spanning several features, and sets its technical direction for the team. |
| IC5 | Shapes technical direction across several teams, choosing which problems those teams should solve. |

Each step changes what the person owns (task, feature, system, multi-team area), not how "strong" they are. Compare the anti-pattern: "IC3: good technical skills; IC4: strong technical skills; IC5: excellent technical skills."

## Adapting to non-engineering families

The same structure works for any knowledge-work family; what changes is the craft dimension and the unit of scope.

| Family | Typical unit of scope as levels rise | Craft dimension focus |
|---|---|---|
| Sales | Deals, then a territory or segment, then a region or motion | Deal strategy, qualification, forecasting accuracy, negotiation |
| Customer success | Accounts, then a book or segment, then programs used across the team | Adoption and renewal planning, risk handling, stakeholder management |
| Marketing | Assets or campaigns, then a channel or program, then a strategy across channels | Message, channel expertise, measurement |
| Finance | Reconciliations and analyses, then a process or business area, then a function-wide model or policy | Accuracy, controls, analytical judgment |
| Operations | Tasks in a process, then a process, then a set of connected processes | Process design, measurement, change management |

Use the organization's own units; the table shows the pattern, not a standard.

## Common mistakes to avoid

- Writing expectations before agreeing tracks, level count, and dimensions.
- Copying another company's ladder wording without calibrating it against this organization's work.
- Using years of experience or degrees as level criteria.
- Making management the only route to senior levels.
- Mapping people by current title rather than evidence of current work.
- Announcing level mapping and pay changes in the same conversation.
- Publishing a ladder no one has tested against real examples, then using it for promotions.

## Rollout

1. Share the draft with managers first and collect feedback on clarity.
2. Train managers to use the ladder in development conversations, not only promotions.
3. Publish to employees with an explanation of how it will and will not be used, the mapping timeline, and the appeal route.
4. Run the first promotion cycle with extra calibration time, and collect feedback on unclear wording.
5. Review the ladder after the first cycle and fix the cells that caused the most disagreement.

Managers should use the ladder in regular development conversations: which next-level expectations the person already meets, which they are working toward, and what opportunities would let them demonstrate them.

## Output

1. **Summary**: family, tracks, number of levels, branch point, dimensions, calibration status (calibrated or uncalibrated), and assumptions.
2. **Dimension definitions**: one sentence each.
3. **Ladder matrix** per track

| Level | Title | Summary (one sentence) | Scope | Impact | Complexity | Autonomy | Leadership and influence | Craft |
|---|---|---|---|---|---|---|---|---|

4. **"What changes from the level below"** for each level: two or three bullets naming the step in kind.
5. **IC and manager equivalence table**

| IC level | Manager level | Shared band | Notes on equivalence |
|---|---|---|---|

6. **Calibration record**: examples used (anonymized IDs), reviewer agreement, wording changed as a result.
7. **Employee mapping plan**: process, panel, timeline, communication, appeal route. Results only if the user supplied them.
8. **Promotion process**: nomination, evidence packet, decision body, timing, feedback, and the evidence standard.
9. **Pay link**: level-to-band mapping, handed to design-comp-bands.
10. **Rollout and maintenance plan.**
11. **Assumptions and open questions.**

## Quality checks

- Every expectation is observable: someone could point to work that meets it or does not.
- Adjacent levels differ in kind (scope, ownership, audience, type of problem), not only in adverbs such as "more", "strong", "deep", or "very".
- Each dimension is defined once and used consistently across levels.
- IC and manager tracks share compensation at equivalent levels, and the IC track reaches as high as the organization genuinely needs.
- Expectations describe outcomes and behaviors, not years of experience, degrees, or personality traits.
- Language is free of terms that are vague or can carry bias ("culture fit", "executive presence", "aggressive", "rockstar"); replace with the observable behavior intended.
- The ladder has been tested against real examples, or is clearly marked uncalibrated.
- The promotion evidence standard requires work already performed at the next level over a sustained period, defined in the process.
- Mapping existing employees is separated from pay changes and has an appeal route.
- No example employee, company ladder, or statistic is invented.

## Boundaries

- Leadership approves the ladder; HR owns the process. This skill drafts and tests the framework.
- Mapping decisions for individuals belong to managers and calibration panels, not to this skill.
- Changing someone's level, title, or pay can have legal and contractual implications (for example, overtime classification in some jurisdictions, or collective agreements). Involve HR and employment counsel before implementing.
- Pay ranges for each level are built with design-comp-bands. Individual reviews use performance-review-draft; job postings use job-description-writer.
- Do not use demographic data in mapping decisions; do review mapping outcomes for disparities with HR afterwards.
