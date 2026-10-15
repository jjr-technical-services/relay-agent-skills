---
name: repurpose-content
description: Turn one approved source, such as a research report, webinar, workshop, annual report, or article, into channel-native assets (newsletter section, social posts per platform, blog post, talking points, slide, email, partner kit) without drifting from what the source says. Builds a source claim register so every claim traces to the source, keeps each statistic with its source, base, and date, sets reading level per audience, adds alt text and captions, and classifies every adaptation as Format only, Wording change, or New claim or audience so staff know how much review it needs. Use when asked to repurpose, adapt, cut down, reuse, or turn an approved report or webinar into posts, emails, talking points, or a partner toolkit. Do not use for writing new content from scratch, a single LinkedIn post from an idea (linkedin-post-from-idea), or drafting a whole newsletter issue (newsletter-issue-draft).
license: MIT
---

# Repurpose Content

Turn one approved piece of content into many channel-native assets while keeping every
claim faithful to the source, and tell staff exactly how much review each adaptation
needs. The expensive part of reuse is not the writing; it is re-reviewing everything
because nobody can tell which edits changed meaning. This skill makes that visible: each
asset is traced claim by claim to the source and carries a reuse class with the change
that triggered it, so a format-only cut ships the same day while a new claim or a new
audience goes back through full review.

## Inputs to gather

Ask for, or retrieve from the organization's library, the following. When something is
missing, proceed with a clearly marked placeholder and list it under open questions.

- **The approved source**, final version, with its approval date and who approved it.
  If only a draft exists, stop and say the source is not approved; reuse needs a fixed
  version to trace to.
- **Approved audiences and uses** recorded at approval (for example "funders and campus
  partners", "general public"), plus any embargo or partner sign-off conditions.
- **Target assets**: which channels, which audiences, required lengths, due dates.
- **House style**: voice, audience phrasing the organization prefers, banned terms,
  logo and co-branding rules, the organization-approved call to action and link.
- **Reading level targets** per audience, if the organization has them. If not, use the
  defaults in references/claim-fidelity.md and label them as assumptions.
- **Review roles**: who owns the content (usually the author or program lead) and who
  runs full review (for example communications lead plus program or research lead).
- **Sensitive-topic flags**: whether the source touches suicide, self-harm, crisis,
  minors, or participant stories.

Do not invent facts, figures, quotes, partner names, or links. If a draft asset needs a
fact the source does not contain, write `TBD: needs source` in the draft and list it.

## Workflow

1. **Freeze the source.** Record title, version or date, approver, approved audiences,
   and any conditions. Everything below traces to this version only.

2. **Build the source claim register.** Extract every claim an asset might use: each
   statistic, finding, quote, recommendation, and program fact. For statistics record
   the number exactly as published, the base (who was asked, how many), the population
   it describes, the time period, the question wording or measure if given, and any
   caveat the source attaches (correlational only, self-reported, small subgroup).
   Give each claim an ID (C1, C2 ...). Read references/claim-fidelity.md for the
   register fields, statistic rules, and the drift patterns to catch.

3. **Set audience and channel targets.** For each asset, name the audience, the job the
   asset does (inform, invite, equip a partner, brief a speaker), the reading level
   target, and the length or format limit. A new audience that was not in the approved
   audiences list is itself a review trigger; note it now.

4. **Draft each asset in its channel's native form.** Do not paste the executive
   summary everywhere. Lead with the single most relevant claim for that audience, keep
   one idea per post or slide, and end with the approved call to action. Read
   references/channel-formats.md when drafting for a specific channel, for partner kits,
   and for accessibility requirements (alt text, captions, hashtags, contrast).

5. **Run the fidelity pass.** Tag every factual sentence in every asset with the claim
   ID it rests on. Any sentence with no ID is either removed or marked `TBD: needs
   source`. Check each tagged sentence against the drift patterns: population widened,
   time frame dropped, correlation turned into cause, rounding that changes meaning,
   base or source removed from a statistic, hedges removed, outcome language added.

6. **Classify every adaptation.** For each asset, list the changes made from the source
   and assign the reuse class. Read references/reuse-classification.md for the decision
   rules and the full trigger list. Summary:
   - **Format only**: same words and meaning in a new shape (excerpt, split, reformat,
     caption, alt text, approved link). No re-review; log it.
   - **Wording change**: meaning preserved but words changed (paraphrase, simplified
     reading level, new headline, translation, combined sentences). Light review by the
     content owner.
   - **New claim or audience**: any claim not in the register, any widened or causal
     claim, a new audience or co-brand, a new sensitive context. Full review.
   The asset takes the highest class of any change inside it. Name the specific change
   that set the class in the Review trigger column.

7. **Run the accessibility pass.** Every image gets alt text; every video gets captions
   and, where the platform allows, a transcript; charts get a one-sentence takeaway plus
   the data in text; links say where they go. Check reading level with the formula in
   references/claim-fidelity.md or the organization's tool.

8. **Route sensitive material.** If any asset touches suicide, self-harm, or a crisis,
   hand that asset to write-safe-mental-health-content before it ships and use the
   `ORGANIZATION-APPROVED CRISIS RESOURCE (insert approved wording)` slot, never an invented line or number.
   If an asset uses a participant's story or quote, check it with write-impact-story.
   Neither route changes the reuse class downward.

9. **Package the output** in the structure below and list open questions.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Source record
2. Source claim register
3. Assets
4. Reuse classification
5. Fidelity check
6. Open questions and placeholders

Use these exact labels where they apply: Format only, Wording change, New claim or audience, Review trigger, Reviewer, TBD, and claim IDs written as plain text such as C3.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

Write plain prose and tables. Do not use Markdown checkboxes, and do not use numbered
bracket citations; cite claim IDs as plain text such as C3.

1. **Source record**: title, version or date, approver, approved audiences, conditions.
2. **Source claim register** (table): Claim ID | Claim as approved | Type | Where in
   source | Base, population, and period | Limits on use.
3. **Assets**, one block per asset: channel, audience, reading level target and
   measured level, the draft, claim IDs used, alt text or caption text.
4. **Reuse classification** (table): Asset | Change from source | Reuse class | Review
   trigger | Reviewer. Reuse class is exactly one of Format only, Wording change, New
   claim or audience. Review trigger names the specific change, not the class.
5. **Fidelity check**: each drift found and how it was fixed. Describe a rejected
   phrasing by its problem ("widened the population from the surveyed group to all
   youth") rather than reprinting it, so the unsupported wording is not copied forward.
6. **Open questions and placeholders**: every `TBD` and assumption, with who can answer.

## Quality checks

Before answering, confirm each of these:

- Every factual sentence in every asset carries a claim ID from the register.
- Every statistic keeps its base, population, and period in the asset or an attached
  note; nothing is described as covering people the source did not measure.
- No correlational finding is written as cause; no self-reported measure is written as
  an observed outcome; no program is described as treating, curing, or preventing a
  condition.
- Every asset has a reuse class and a named review trigger; an asset for an audience
  outside the approved list is classed New claim or audience.
- Reading level is stated per asset and meets the target or the gap is explained.
- Images have alt text, videos have captions, and links are descriptive.
- No invented numbers, quotes, partner names, crisis lines, or links.
- No hype adjectives, and no claims of proof unless the source proves it
  and says so.

## Boundaries

- This skill adapts approved content; it does not approve content. Final approval sits
  with the organization's named reviewers.
- It does not create new findings, re-analyse survey data, or add outside statistics.
  Adding outside data turns the asset into new content that needs its own source.
- Partner and co-branded kits may need the partner's own legal or brand review; the
  skill flags this but does not decide it.
- Crisis and suicide-related messaging goes to write-safe-mental-health-content, and
  participant stories go to write-impact-story. Performance measurement of the finished
  assets belongs to report-communications-performance.
