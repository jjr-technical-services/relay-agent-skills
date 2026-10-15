---
name: landing-page-design
description: Design and build conversion-focused landing pages with benefits-led copy, production-grade React and Tailwind, and source-grounded product screenshots when a SaaS or app can be inspected. Use for landing pages, product pages, campaign pages, and other focused marketing experiences. Respects a supplied claim register and places only selected, evidenced screenshots from a validated screenshot pack.
---

# Landing Page Design

Create conversion-first landing pages that feel genuinely designed, not cookie-cutter, with compelling benefits-focused copy and production-ready React and Tailwind code. Combine direct-response messaging discipline with high-end interface craft.

The user may provide: offer, audience, product or service, proof points, pricing, brand voice, constraints, examples, and the desired conversion action (book, buy, subscribe, download, apply).

## Run unattended when no one can answer

When a workflow or another skill runs this skill, or questions would go unanswered, ask nothing. Take the offer, audience, positioning and proof from supplied handoffs (`relay.gtm.foundation.v1`, `icp_uvp_handoff`, `marketing_strategy_handoff`) when they exist. Record every input you still had to guess as a labeled assumption in `landing-page-content-map.md`, and continue.

## Respect the claim register

When a GTM foundation record supplies a claim register:

- Never put a `forbidden` claim on the page, in alt text, or in metadata.
- Use an `unverified` claim only with visible qualification, and flag it in the content map.
- Prefer `allowed` claims and cite their evidence in the content map.

With or without a register, never invent testimonials, customer names, logos, metrics, ratings, case studies, or results. When a section calls for proof you do not have, build it as a clearly labeled placeholder (for example, "Customer quote — add after approval") and list it in the content map as proof still needed.

## Product-led screenshot stage

For a SaaS product, mobile app, dashboard, developer tool, or other visual software, treat product imagery as evidence rather than decoration. When source code or an authorized product environment is available, use `$create-marketing-screenshot-pack` before finalizing the page design:

1. Read that skill's full `SKILL.md` when this stage begins; preserve its read-only authentication, data handling, evidence-state, raw-asset, filename, and validation rules.
2. Give it the audience, intended claim, destination page, brand constraints, allowed account or fixture, and needed layout ratios from the conversion brief.
3. Accept one screenshot pack as the stage output: its root path, `pack.md`, `manifest.json`, and validated assets. Do not treat a successful login or a visible control as proof that a workflow succeeds.
4. Freeze that pack for the page build. Map its images to page sections before implementation; do not silently swap to a different capture or fabricate UI later.
5. Keep the screenshot pack as the evidence source. Copy only chosen derivatives into the site's public assets, and record their original relative paths and evidence status in the page content map.

Read [Product screenshot merchandising](references/product-screenshot-merchandising.md) when the page promotes a software product or uses product captures. It defines section roles, selection tests, responsive art direction, accessibility, performance, and the required asset map.

### Use the pack manifest directly

A schema 2 `manifest.json` carries what the page needs, so use it rather than re-measuring:

- Place only screenshots with `selected: true`. Unselected captures are supporting evidence, not page assets.
- Map `pageRole` to page sections with the table in the merchandising reference: `hero` to the hero, `feature` to a benefit story, `workflow` to an ordered workflow section, `proof` to trust, control, or case-study sections, `mobile` to mobile proof, `detail` to supporting detail. Never place `archive` captures.
- Set each image's intrinsic `width` and `height` from `dimensions` for the file variant you use.
- Start from `altText` and adapt it to the section's claim; keep it describing what the image shows.
- Never place a `blocked` capture, and never describe `source-inferred` or `observed` behavior as successfully exercised.

For a schema 1 pack, ask the screenshot skill to upgrade it, or record the missing fields yourself in the content map before building.

If neither source nor authorized product access is available, create a bounded capture brief with the routes and states needed, and use clearly labeled placeholders in the implementation. Never invent screenshots or present mock UI as observed product evidence.

## Plan the conversion

Before writing or coding, establish a conversion plan.

### Conversion goal

Pick the single primary action: book a call, start a free trial, buy now, download a lead magnet, join a waitlist, request a demo, or subscribe. Everything supports this action. Secondary CTAs are allowed but never compete.

### Audience and job to be done

Identify who this is for (role, sophistication, urgency), what they want (outcome), what stops them (risk, effort, trust, budget, timing), and what they tried before and why it failed.

### Offer architecture

Define the offer in one sentence: "We help [audience] achieve [outcome] in [timeframe] without [common pain]." Include:

- core promise (measurable);
- mechanism (why this works);
- risk reversal (guarantee, pilot, cancel anytime, pay on success);
- proof (case studies, metrics, logos, testimonials, credentials), only as evidenced;
- urgency (availability, timeline, bonus, deadline) without fake scarcity.

### Message hierarchy above the fold

Communicate, in order: outcome, specificity (how or what), differentiation (why you versus alternatives), proof, and one primary CTA.

### Objection mapping

Address the top objections in page structure and microcopy: Will this work for my situation? How much effort is required? What is the risk if it fails? Why should I trust you? How long will it take? What does it cost and what is included?

### Conversion UX rules

- Use one dominant CTA style consistently.
- Repeat the CTA at natural decision points: hero, after benefits, after proof, after pricing.
- Keep forms short; ask only what you can truly use.
- Use progressive disclosure for details (accordions, modals, expandable sections).
- Make the next step feel safe: clear expectations, privacy note, no spam.

## Write the copy

Write copy that is benefits-first, specific, skimmable, concrete (numbers, timeframes, examples), and confident rather than hyped.

- Lead with outcomes and support them with the mechanism.
- Avoid buzzwords unless the audience expects them.
- Use "you" more than "we".
- Replace claims with proof wherever possible.
- Make every section earn its place: it either builds desire or reduces friction.

Match the brand voice. If none is given, be clear, modern, credible, and slightly opinionated, with no clichés, empty superlatives, or filler.

Required copy elements: hero (headline, subhead, CTA, microtrust); benefits (three to six outcomes, each with detail); mechanism (how it works in three to five steps); proof (testimonials, metrics, case studies, logos, screenshots — evidenced or labeled placeholders); risk reversal; pricing or packages (simple, anchored, with inclusions); FAQ that answers objections; and a decisive final CTA.

## Choose a structure

- **High-intent service (demo or call):** hero, proof strip, outcomes, how it works, case studies, packages, FAQ, final CTA.
- **Product or trial:** hero with one legible product outcome, feature-to-benefit stories with distinct captures, workflow or use cases, social proof, comparison, pricing, FAQ, final CTA.
- **Lead magnet or download:** hero, what you'll get, who it's for, quick proof, form, FAQ, final CTA.
- **Event or webinar:** hero, what you'll learn, speakers and proof, agenda, registration, FAQ, final CTA.

## Commit to a design direction

Before coding, commit to a bold, distinctive design concept that supports conversion:

- high contrast between the CTA and its surroundings;
- clear typographic hierarchy, with a dominant headline and strong section headers;
- intentional whitespace that guides scanning;
- highly visible proof;
- calm, premium, readable confidence;
- one memorable visual motif (shape language, texture, border treatment, or grid system).

Avoid the generic startup template: purple gradients on white, predictable card grids with mild shadows, default Inter, Roboto or system fonts, and an uncrafted hero-plus-three-cards-plus-FAQ pattern. Choose a distinctive display and body pairing, a cohesive color system with one sharp accent, and depth through texture, grain, pattern, editorial layout, asymmetry, or refined minimalism. Use motion sparingly and with purpose: a page-load sequence, CTA hover, or scroll reveals. When the destination project has its own design system or tokens, follow them instead.

## Implement in React and Tailwind

- Production-grade React with clean components and props.
- Responsive and mobile-first.
- Accessible: semantic HTML, focus states, and ARIA where needed.
- Performant: no heavy libraries unless needed.
- Tailwind with consistent tokens, preferably CSS variables (`--bg`, `--fg`, `--muted`, `--accent`, `--border`).
- Product imagery uses intrinsic dimensions and responsive sources. The above-fold hero is not lazy-loaded; below-fold captures are.
- Use `<picture>` when mobile needs a different crop or product state; use `srcset` and `sizes` when only resolution changes.
- Give informative screenshots concise alt text describing the visible outcome; use empty alt text for purely decorative frames when adjacent copy already carries the meaning.

Conversion components: a primary CTA button (optionally sticky on mobile), a lead form or booking module, a testimonial or case-study block (evidenced or a labeled placeholder), "what happens next" microcopy under CTAs, and a trust strip (logos, stats, security, guarantee — evidenced only).

## Deliver

- `LandingPage.tsx` (or `page.tsx`) with reusable components (Hero, Benefits, Proof, Pricing, FAQ, Footer).
- `landing-page-content-map.md`: each section's job, claim, claim-register status, CTA, product asset filename, source-pack path, evidence status, `pageRole`, crop or frame rationale, alt text, assumptions, and proof still needed.
- A public asset folder containing only selected web-ready derivatives, with the validated screenshot pack left intact at its original path.

## Execution process

1. Extract inputs and infer missing essentials (offer, audience, CTA, proof, objections). Label unsupported claims as assumptions.
2. Choose the structure and define what each section must prove.
3. For visual software, run the product-led screenshot stage and validate the pack before selecting page assets.
4. Create `landing-page-content-map.md`, pairing every major claim with copy, proof, a screenshot role where useful, and one next action.
5. Write the full page copy around the evidence actually available.
6. Design a bold aesthetic direction consistent with the offer, audience, brand, and legibility of the product UI.
7. Implement in React and Tailwind, using art-directed desktop and mobile assets where the pack shows materially different responsive states.
8. Validate clarity above the fold, CTA prominence, objection coverage, proof density, image performance, asset provenance, claim-register compliance, accessibility, and mobile UX.

## Hard rules

- Do not produce bland, generic landing pages, bury the offer or CTA, or write vague "transform your business" claims.
- Do not overload the page with animation or gimmicks that reduce clarity.
- Do not stretch one dashboard screenshot across unrelated feature claims or use a dense full-page capture where the product state becomes illegible.
- Do not place every screenshot in a device frame. Frame only to clarify platform context or improve a specific composition.
- Do not expose private customer data, internal identifiers, credentials, or transient error or loading states in page assets.
- Do not publish a forbidden claim or any invented proof.

## Quality gate

A page is acceptable only when:

- the hero communicates outcome and specificity in five seconds;
- the CTA is visually dominant and repeated logically;
- benefits are concrete and user-centric;
- proof is credible, evidenced, and quantified where possible, and every missing proof is a labeled placeholder;
- no forbidden claim appears, and every unverified claim is qualified and flagged;
- every product image is a selected pack asset with a named job, correct intrinsic dimensions, and traceable source path;
- desktop and mobile imagery stay legible and show an appropriate product state;
- objections are handled explicitly;
- the design feels bespoke, not templated;
- the code is clean, responsive, accessible, and shippable.
