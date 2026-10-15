# Collecting writing samples with consent

The corpus determines the ceiling. A large corpus of contaminated samples produces a worse profile than a small clean one, because contamination is invisible in the output — it just makes the voice slightly wrong in ways nobody can name.

## Sample schema

Do not fetch or retain source material until the user has identified the authorized subject, selected the source and time window, and chosen whether samples may be persisted. Connector access is capability, not consent. Keep collection read-only.

If the user approves local sample retention, write one JSON object per line to `~/.codex/voice/<profile-id>/samples/<source>.jsonl`:

```json
{"id": "slack-0007", "source": "slack", "register": "slack-internal", "date": "2026-08-14", "context": "reply to teammate asking why the deploy was held", "audience": "engineer, peer", "words": 62, "text": "..."}
```

- `register` — one of `slack-internal`, `slack-external`, `email-client`, `email-internal`, `doc-longform`, `published-public`.
- `context` — one line on what prompted the writing. Needed later to tell a terse message caused by haste from a terse register.
- `audience` — who it was written for. Voice shifts more by audience than by channel.
- `text` — the user's own composed prose only, after the filters below.

## Sample screening

Authorship and AI-contamination screening lives in [authenticity.md](authenticity.md). Read it before accepting any document. The filters below are summarized there in full.

### Filters — apply to every sample

Exclude, without exception:

- **Anyone else's words.** Quoted replies, forwarded bodies, pasted text, `>` quote blocks, transcript excerpts, message threads where authorship is ambiguous. In email this is the single largest contaminant: strip everything below the reply separator before storing.
- **Boilerplate.** Signatures, disclaimers, auto-text, calendar invites, out-of-office, templated openings the user did not compose that time.
- **AI-assisted or templated text with known provenance.** Label or exclude it when the subject says a model, template, editor, or collaborator materially shaped it. A stylistic mismatch is a reason to ask, not proof of how text was produced.
- **Non-prose.** Link-only messages, emoji-only reactions, `+1`, `lgtm`, code blocks, command output, pure lists of names or numbers. Keep prose that surrounds code; drop the code.
- **Sub-threshold fragments.** Under 15 words carries no measurable rhythm. Keep a few of the sharpest as register color, marked `fragment: true`, and exclude them from the metrics run.

Prefer samples where the user was explaining, persuading, deciding, disagreeing, or delivering bad news. Those reveal voice. Logistics and acknowledgments do not.

## Current conversation — opt in first

The current conversation is available without a connector, but availability is not permission to turn it into a profile corpus. Offer it as an input and use it only when the user opts in. Exclude pasted, quoted, dictated, or forwarded text unless its authorship is separately established.

- **Verbatim and unedited.** No editor, no template, no revision pass.
- **Often direct.** Short directives and corrections can expose useful habits.
- **Still requires screening.** A message can contain pasted text, transcription, co-authored language, or model output.
- **No connector needed.** This reduces setup, not the consent requirement.

After opt-in, select only the subject's own messages needed for the requested registers. Register them as `chat-directive` (or `chat-conversational` if the exchange is not task-driven). Do not persist the entire conversation by default.

What it reveals that polished sources cannot:

- Real-time typing habits — dropped apostrophes, uncorrected typos, sentence-initial lowercase, and whether these are consistent rules or just speed.
- How they open and close when there is no convention forcing a greeting.
- How they phrase a correction, a boundary, and a change of direction.
- Whether they attach reasoning to an instruction or issue it bare.
- Their hedging rate when speculating, which is often higher here than anywhere else.

Two caveats to state in the profile. The sample is usually small — a long session may yield only a few hundred words. And directing an agent is a specific mode, not general conversation; do not generalize it to how they write to people.

Its real power is **corroboration**. A trait confirmed in chat *and* in Slack *and* in email is core with high confidence, because the three have completely different production paths.

## Slack

Use an authorized read-only Slack search capability only when the user selected Slack. Confirm the subject's account identity and search only that person's messages within the agreed workspace, channels, and time window.

Resolve the authorized subject's own Slack user ID first, then search their messages with the `from:` modifier; angle brackets around an ID are literal:

```
from:<@U0XXXXXXX> after:YYYY-MM-DD
```

- Slack search has no boolean operators and space-separated terms are ANDed, so vary the query across several runs rather than building one large query. Sweep by topic word, by channel, and by month to get spread instead of whatever one query ranks highest.
- Set `sort: "timestamp"` for even coverage across the window. Relevance sort clusters samples around whatever the query words were, which biases the register mix.
- Set `include_bots: false` and raise `max_context_length` so messages are not truncated mid-sentence — a truncated sample corrupts sentence-length metrics.
- `channel_types` separates registers: `public_channel,private_channel` for `slack-internal`; DMs and group DMs (`im,mpim`) are mixed and need per-thread judgment on whether the counterpart is internal or external.
- Read thread context only when needed to classify a selected sample. Never retain another participant's text; store **only** the authorized subject's own messages.

Assign register by counterpart, not by channel type. A DM to a client is `slack-external`.

### Probe for non-text expression before concluding a trait is absent

A `from:` text search finds strings. It cannot find behavior expressed in another medium,
and chat is where most people put that behavior.

**GIFs are the trap.** The Giphy integration posts with **empty message text** and a `[BOT]`
marker on the user's own account. Every text search returns them as blank rows, so a
corpus built from message text alone will show a person as having no humor in Slack when
they are in fact posting GIFs several times a week. This has caused a wrong profile in practice: a
calibration reported "no humor in this register" while the person was posting GIFs several
times a week.

Run these before characterizing any chat register:

- `from:<@USER_ID> giphy` — GIF posts. Count them and note the date span; compare that count
  against how many text messages cleared the length bar.
- `content_types="files"` with `from:<@USER_ID>` — images, screenshots, recordings.
- Reaction habits, if the connector exposes them.

Record what you find as **behavior with a rate**, not as samples — there is no prose to
measure, and inventing a sample from a GIF would be fabrication. Note explicitly that the
*content* of the GIFs is unmeasured.

The general rule: a negative from one method proves a string absent, never a behavior
absent. Before writing "this register has no X", ask what medium X would take here and
whether the search you ran could have seen it.

## Sent email

Use authorized read-only email search only when the user selected sent email. Search the authorized subject's Sent mailbox within the agreed time window; do not inspect Inbox, Drafts, other accounts, or unrelated folders.

```
in:sent from:me newer_than:18m -in:draft
```

- Search results may contain snippets rather than bodies. Read the selected message before accepting it; never build a sample from a truncated snippet.
- Split the reply chain and keep only the user's top segment. Everything below the quote separator belongs to someone else.
- Register split: `email-client` for anyone outside the company, `email-internal` for colleagues. Domain of the recipient is the reliable signal.
- Skip threads where the user's message is under 25 words unless it is a complete note; one-line email replies are logistics, not voice.
- Exclude automated and transactional sends, and anything to a list.

## Google Drive documents

Use authorized read-only document search only when the user selected a document collection. Scope the search to the agreed folder, owner, and time window.

```
owner = 'me' and mimeType = 'application/vnd.google-apps.document' and modifiedTime > '2025-03-01T00:00:00Z'
```

- Ownership is not authorship. A doc the user owns may be mostly written by others or assembled from templates. Read before accepting, and take only sections in the user's hand.
- Collaborative docs are the worst contamination risk in the corpus. If contributors cannot be separated, drop the document.
- Prefer memos, proposals, strategy notes, and narrative sections. Skip meeting notes, agendas, and tables — they are structured capture, not composed prose.
- Long documents should contribute two or three representative sections, not their full text. One long doc otherwise dominates every metric.

## Published online writing

Ask the user for URLs — LinkedIn profile or posts, blog, newsletter, personal site, conference writeups. Do not guess at URLs or search for the user's name across the web to assemble a corpus; collect only what they name.

Read only the URLs the user names. Do not broaden into a web search for more examples.

- This is the most edited register and the least like how the user writes unaided. Weight it for `published-public` and let it inform core voice only lightly.
- Strip site chrome, bylines, headers, footers, comments, and any editor's introduction.
- On LinkedIn, posts are the user's voice; reshares with a one-line comment are near-worthless; article comments by others are contamination.
- Record the publication date. Public writing from three years ago may reflect a voice the user has moved on from.

## Balancing the corpus

Check the mix before analyzing. Two failure shapes:

- **Register imbalance.** Slack is the easiest source to collect in bulk and will silently dominate, pulling the core voice toward terse and informal. Cap any single source at roughly 40% of the corpus.
- **Recency imbalance.** Search relevance favors whatever matched, not whatever is recent. Verify spread across the window and backfill thin months.

Report the final composition — counts by register, by source, by quarter — before building the profile. If a register the user wants to write in has fewer than 15 samples, say so plainly rather than generating rules from four examples.
