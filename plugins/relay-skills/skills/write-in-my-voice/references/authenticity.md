# Screening samples for authorship

The corpus determines the ceiling. A large corpus of contaminated samples produces a worse profile than a small clean one, because contamination is invisible in the output — it just makes the voice slightly wrong in ways nobody can name.

One common contaminant is **the person's own AI-assisted output**, which they reviewed, approved, and stored under their own name. Feeding it back without labeling can make the profile reflect a prior model rather than the subject.

**Treat authorship as unverified until provenance supports it.** Ownership is not authorship, and style alone cannot reliably prove whether text was AI-assisted.

## Ten tells, cheapest first

Run these before reading a document's prose. Most contamination is caught by metadata alone.

**1. Creation-timestamp bursts.** Sort candidate documents by creation time. A run of substantial documents created minutes apart is a reason to ask about their production history, not proof of generation by itself.

**2. Byline.** Check for an author field before anything else. A document credited to a team, a content function, or an unnamed group is not the person's prose regardless of who owns the file.

**3. A narrator who is not them.** Scripts, courses, and marketing assets often use a persona. If the first person in the text resolves to someone other than the subject, it is character voice — exclude it even if they wrote every word.

**4. A `Sources` or `References` section** may indicate a research workflow. Confirm provenance rather than inferring authorship from formatting.

**5. Their own instructions quoted back.** Repeated house rules, style guidance, or agent instructions may come from a template or system workflow. Ask how the document was produced.

**6. Uniform titles across a set.** Repeated title constructions may indicate a template. Label or exclude the set unless provenance is clear.

**7. Structural scaffolding instead of prose.** Repeating `Phase 1 / Objective / Activities / Deliverables` blocks, or an evidence-label taxonomy applied uniformly, is a framework being filled in — not composed writing. It carries no voice even when the person did assemble it.

**8. Vocabulary that differs from confirmed samples.** This is a review signal, not authorship proof; audience, editing, and subject matter also change vocabulary.

**9. Size outliers.** A much larger document may be assembled, collaborative, or heavily edited. Confirm before using it.

**10. An engaging title on generated content.** A playful or personal title is often the one human contribution to an otherwise generated document. Judge the body, never the title. *Observed twice in one calibration.*

## Boilerplate is the subtler trap

Reused text is genuinely theirs and still misleads, because it was composed once — possibly years ago, possibly by someone else — and pasted since.

**Detect it by comparing documents of the same genre across time.** Two proposals, two bios, two intro emails. Verbatim shared paragraphs mean boilerplate.

*Observed: a proposal cover letter appeared to break the profile's strongest rule. Comparing it to an Intent to Bid from 19 months earlier showed entire paragraphs shared word for word, including the offending sentence. It was a maintained marketing block, not live composition.*

Treat boilerplate as **a document the person owns, not a register they write in**. Record it, exclude its measurements from the rules, and say so.

When a sample contradicts an otherwise strong rule, check for boilerplate before concluding the rule is wrong. Reused text is a far more common explanation than a genuine stylistic exception.

## Authorship filters — apply to every sample

Exclude, without exception:

- **Anyone else's words.** Quoted replies, forwarded bodies, pasted text, `>` blocks, transcript excerpts, reblogged or shared content with a one-line reaction attached. In email this is the single largest contaminant: strip everything below the reply separator. On social platforms, a share plus a comment yields only the comment.
- **Boilerplate.** Signatures, disclaimers, auto-text, templated openings the person did not compose that time.
- **AI-assisted or templated text with known provenance.** Label or exclude it; do not classify authorship from style alone.
- **Non-prose.** Link-only messages, reactions, `+1`, `lgtm`, code blocks, command output, bare lists of names or numbers. Keep prose surrounding code; drop the code.
- **Sub-threshold fragments.** Under 15 words carries no measurable rhythm. Keep a few of the sharpest as register color, marked `fragment: true`, and exclude them from the metrics run.

Prefer samples where the person was explaining, persuading, deciding, disagreeing, or delivering bad news. Those reveal voice. Logistics and acknowledgments do not.

## Report the screening

Name what you excluded and why. A calibration that reports "40 documents found, 2 usable, here is what the other 38 were" is far more useful than one that quietly keeps 40, and it tells the person something true about their own archive.

Distinguish `not found in the reviewed sample` from `does not exist`.
