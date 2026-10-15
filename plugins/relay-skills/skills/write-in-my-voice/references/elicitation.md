# Calibrating without connectors

A person with no connected tools can still get a real profile. Three intake paths, usable alone or together. Offer all three, let them pick, and never make a connector a precondition.

| Path | Effort | Sample quality |
|---|---|---|
| **Selected messages from this conversation** | Zero | High when opted in and screened for pasted or quoted material |
| **Paste or upload** | Low | High, but needs screening |
| **Guided writing prompts** | 20–40 min | Good, with a caveat below |

## Path 1 — use selected messages from this conversation

Already in context and often useful, but not automatically authorized as profile material. Offer it as an option. If the user opts in, exclude pasted or quoted third-party text and treat a short exchange as tentative evidence only.

Preview which messages or traits you propose to use without persisting them. Let the user correct authorship or decline this path.

## Path 2 — paste or upload

Ask for what is easy to reach, in this order:

1. **Sent email** — 5–10 they wrote, ideally mixing routine and difficult. The best single source most people can supply without tooling.
2. **Chat exports or screenshots** — informal register, hardest to get elsewhere.
3. **Published writing** — posts, newsletters, articles. Easy to supply, most edited.
4. **Documents** — only ones they drafted themselves. Screen every one per [authenticity.md](authenticity.md).

State plainly what to leave out, because people over-supply polished material:

- Anything a model drafted, even if they edited it
- Anything a colleague co-wrote or an editor reworked
- Templates, boilerplate, and anything pasted between documents
- Quoted replies and forwarded text

**Ask for the unpolished stuff explicitly.** People instinctively send their best writing, which is their least characteristic. Say: *"Send the fast ones, typos and all. Those are worth more to me than the polished ones."*

Accept files of any type they have. Read them, screen them, and report what you kept and what you dropped.

## Path 3 — guided writing prompts

When they have little to supply, generate the corpus. Give them concrete scenarios and ask them to write the real thing.

**Design rules for prompts:**

- Name a specific situation, never "write something in your voice."
- One register per prompt.
- Ask them to write to a real person about a plausible thing.
- Favor situations with friction — bad news, refusal, disagreement, correcting someone. Those reveal voice; logistics do not.
- Keep each answerable in under five minutes.
- Tell them not to polish. Explicitly: *"First draft. Don't reread it."*

**The prompt set.** Offer 6–10, let them skip any. Adapt the details to their actual work.

1. **Quick internal message.** "A teammate asks if they can push a deadline two days. You're fine with it but there's a dependency they've missed. Reply as you would in Slack."
2. **Bad news to a client.** "You're going to miss a date by a week. The cause is on your side. Write the email."
3. **Saying no.** "A client asks for something out of scope and is being pleasant about it. Turn it down without damaging the relationship."
4. **Disagreeing upward.** "Someone more senior proposes an approach you think is wrong. Say so."
5. **Explaining something technical.** "Explain a piece of your work to a smart person outside your field who has to make a decision about it."
6. **Recognition.** "Someone on your team did something genuinely good. Tell them."
7. **A public opinion.** "Write the opening 150 words of a post making a case you actually believe about your field."
8. **Owning a mistake.** "Something went wrong and it was your call. Write the message."
9. **Asking for something.** "Ask a busy person for a favor you have no leverage to demand."
10. **Thinking out loud.** "Describe a problem you haven't solved yet, as if working through it in notes."

Prompts 2, 3, 4 and 8 usually produce the most distinctive writing, and they fill the register most corpora are missing. If they will only do three, ask for those.

**The caveat, and record it in the profile.** Writing to a prompt is performed, not natural. People are more careful, more complete, and often more formal than they would be in the moment. Elicited samples should be:

- marked `elicited: true` in the sample record
- labeled at most `moderate` confidence, never `strong`
- weighted below anything collected from real correspondence
- treated as suspect wherever they contradict a natural sample

If a trait appears only in elicited samples, say so as an explicit limitation.

## Mixing paths

A strong low-effort combination, when the user selects each source, is **selected messages from this conversation + 5 sent emails + prompts 2, 3 and 8**. That covers informal, real correspondence, and the friction registers, and it usually takes the person under twenty minutes.

Report the composition — how many samples, from which path, in which registers — before building the profile, and name which registers remain uncalibrated.

## Re-asking later

A profile built this way should improve from use rather than from another intake session. After each draft the person corrects, run the refine loop in [drafting.md](drafting.md). Their edits are natural writing about a real task and outrank every elicited sample.

Tell them this up front. It sets the expectation that the first profile is a starting point, and it makes the correction loop feel like progress rather than rework.
