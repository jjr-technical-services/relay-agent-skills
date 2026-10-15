---
name: write-safe-mental-health-content
description: Write or review mental-health content (social posts, articles, emails, event pages, press materials, video scripts) using recognized safe-messaging practice and non-stigmatizing, people-first language. Produces a review with every finding labelled Must fix, Should fix, or Consider and a specific rewrite for each, places crisis resources using the organization-approved slot, adds content notes where needed, checks images and headlines, writes a comment moderation plan for social posts, and says when to route to the organization's clinical or safety reviewer. Use when drafting or checking anything that mentions suicide, self-harm, a death, a mental-health crisis, or mental illness, including memorial and awareness-month campaigns. Do not use for a quick one-pass check (safe-messaging-review prompt), clinical advice or risk assessment, or general copyediting.
license: MIT
---

# Write Safe Mental-Health Content

Write and review mental-health content so it helps readers and does not raise risk for
people who are struggling. Safe-messaging practice exists because how suicide and
crises are described can influence vulnerable readers: detail about method or location,
framing suicide as a response to a single event, and dramatic language are linked in
the research literature to imitation risk, while stories of coping and help-seeking are
associated with protective effects. This skill applies that practice as a full method:
a severity-labelled review, concrete rewrites, correct crisis-resource placement,
image and headline rules, a moderation plan for social channels, and clear escalation to
the organization's clinical or safety reviewer. It is not clinical guidance and never
assesses anyone's risk.

The practice draws on widely used guidance such as the Recommendations for Reporting on
Suicide and the Framework for Successful Messaging from the National Action Alliance for
Suicide Prevention. Describe practices in your own words; do not quote or paraphrase
those documents as if reproducing them, and do not invent what they say. If the
organization has its own messaging guide, it takes precedence.

## Inputs to gather

- **The draft or brief**: full text, headline, images and their captions, links, and
  where it will run (channel, audience, paid or organic, comments on or off).
- **Audience**: especially whether minors, students, or people bereaved by suicide are
  likely readers.
- **Organization-approved crisis resource copy**: the exact wording the organization
  has approved. If not supplied, use the slot `ORGANIZATION-APPROVED CRISIS RESOURCE (insert approved wording)`
  and list it as an open item. Never invent a line, number, text code, or URL. As a
  general fact, in the US the 988 Suicide & Crisis Lifeline can be reached by call or
  text at 988; still use the organization's approved wording where one exists.
- **Organization language guide** and preferred audience phrasing.
- **Who reviews**: the organization's clinical or safety reviewer, and who moderates
  comments and when.
- **Permissions** for any named person, family, or story (route story consent questions
  to write-impact-story).

Label every assumption. If the channel or audience is unknown, assume a public audience
that includes young people and people at risk, and say so.

## Workflow

1. **Classify the content's risk level.** Content that mentions suicide, self-harm, a
   death by suicide, or an active crisis is high sensitivity. General mental-health
   awareness, stress, and wellbeing content is standard sensitivity. High sensitivity
   triggers the full checklist, crisis-resource placement, and reviewer routing.

2. **Review against the safe-messaging checklist.** Read
   references/safe-messaging-checklist.md and go through every item: method and location
   detail, single-cause framing, suicide as solution or inevitable, sensational or
   romanticized language, glorifying or memorial framing that could appeal to at-risk
   readers, statistics framed as an epidemic, missing hope and help-seeking, fundraising
   pressure attached to a death, and clinical claims.

3. **Label every finding with a severity.**
   - **Must fix**: raises risk or breaks a hard rule. Method or location detail,
     crime language, single-cause framing, suicide as a solution, invented or unverified
     crisis resource, clinical claims, graphic images, guilt or fear used to ask for money.
   - **Should fix**: weakens safety or stigmatizes. Missing help-seeking message,
     statistics without context, deficit or stigmatizing terms, a headline that
     sensationalizes, missing content note.
   - **Consider**: improves clarity or tone. Warmer phrasing, adding a coping story,
     plainer language, better alt text.

4. **Write the rewrite for every finding.** Give the replacement text, not only the rule.
   Identify the problem text by location and category (for example "sentence 1, method
   and location detail") and paraphrase the issue. Never reprint harmful wording, method,
   location, or the crime verb in the review itself, because reviews get forwarded and
   copied. Read references/language-guide.md for people-first swaps.

5. **Place crisis resources.** Read references/crisis-resources-and-moderation.md.
   Put the `ORGANIZATION-APPROVED CRISIS RESOURCE (insert approved wording)` slot, filled only with the
   organization's approved copy used verbatim, in the placement each channel requires:
   in the post body or first lines (not only in comments or a link), near the top and
   at the end of long articles, on event pages and registration confirmations, and in
   video captions and end cards. Replace any crisis line, number, or code in the draft
   that is not confirmed against the organization's approved copy.

6. **Decide on a content note.** Add a short content note at the top when the piece
   discusses suicide, self-harm, or a death in any detail, and when it is a personal
   story. Keep it brief and pair it with the crisis slot.

7. **Check images and headlines.** Images: no method, location, or the scene of a death;
   no images of distress used to draw attention; prefer people connecting, getting
   support, or neutral imagery. Headlines: no method, no cause, no word "suicide" as a
   hook in a teaser, no sensational verbs.

8. **Plan comment moderation for social posts.** Write the comment moderation plan:
   who watches, for how long, response templates, what to hide or remove, how to
   respond to someone who may be in crisis, and when to turn comments off.

9. **Route to the clinical or safety reviewer** whenever the piece is high sensitivity,
   involves a named person who died, is aimed at youth, includes a lived-experience
   story, or includes any statement about symptoms, treatment, or outcomes. The skill
   prepares the draft; the reviewer approves.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Summary
2. Safe messaging review
3. Revised draft
4. Crisis resource placement
5. Content note
6. Images and headline
7. Comment moderation plan
8. Clinical or safety reviewer routing

Use these exact labels where they apply: Must fix, Should fix, Consider, organization-approved crisis resource, safety reviewer.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not use square brackets or curly braces anywhere in the answer. Write the crisis slot exactly as `ORGANIZATION-APPROVED CRISIS RESOURCE (insert approved wording)`, and never in a heading.

### Section contents

Write plain prose and tables. Do not use Markdown checkboxes. Write the crisis slot exactly
as `ORGANIZATION-APPROVED CRISIS RESOURCE (insert approved wording)`.

1. **Summary**: sensitivity level, whether it can publish after fixes, reviewer needed.
2. **Safe messaging review** (table): Finding number | Location | Issue, described
   without reprinting harmful wording | Severity (Must fix, Should fix, or Consider) |
   Rewrite.
3. **Revised draft**: the full corrected text for each channel.
4. **Crisis resource placement**: where the slot appears in each version and why; list
   any unverified resource removed from the draft.
5. **Content note**: the note text, or why none is needed.
6. **Images and headline**: decision and replacement suggestions.
7. **Comment moderation plan** for any social channel: owner, watch window, templates,
   hide or remove rules, crisis-response steps, escalation.
8. **Clinical or safety reviewer routing**: what the reviewer must check and open items.

## Quality checks

- Every finding has a severity label and a concrete rewrite.
- No method, means, or location detail survives anywhere, including the review.
- The review and the revised draft say "died by suicide" or "death by suicide", and the
  crime verb does not appear anywhere in the output, even as a quoted example.
- Suicide is never presented as caused by one event or as a way to solve a problem.
- Every high-sensitivity version includes hope and a help-seeking message plus the
  crisis slot in the channel-appropriate placement.
- No crisis number, text code, or URL appears unless it is the organization's approved
  copy; otherwise the slot is used.
- No clinical claims: nothing says content, programs, or donations treat, cure, prevent,
  or save anyone.
- Fundraising content uses no guilt, fear, or countdown urgency tied to a death.
- Social versions have a comment moderation plan.

## Boundaries

- Not clinical guidance. The skill never assesses an individual's risk, gives treatment
  advice, or responds to a person in crisis beyond pointing to the approved resource and
  the organization's escalation procedure.
- The organization's clinical or safety reviewer has final say on high-sensitivity
  content; legal counsel reviews anything involving a named deceased person where the
  family's permission or privacy is in question.
- For reusing approved content across channels use repurpose-content; for consent and
  framing of personal stories use write-impact-story.
