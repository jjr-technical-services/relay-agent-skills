# Product screenshot merchandising

Use this reference for SaaS and app landing pages after `$create-marketing-screenshot-pack` has produced a validated pack. The pack is the evidence source; this reference decides how its assets earn space on the page.

## Give every image one job

A product screenshot should do at least one of these jobs:

- make the promised outcome tangible;
- explain a differentiating mechanism;
- show a meaningful step in the user's workflow;
- reduce risk by showing control, collaboration, permissions, review, or traceability;
- prove that the product works in the device context the audience cares about.

If removing an image does not weaken comprehension or trust, remove it. Do not use a screenshot merely to fill a section or make the page feel more “product-led.”

## Map pack assets to page roles

| Page role | Best screenshot | Composition guidance | Avoid |
| --- | --- | --- | --- |
| Hero | The clearest visible end state or core mechanism | One dominant capture, legible at first viewport; crop to the decisive UI and add a neutral laptop/phone frame only when platform context matters | Dense full-page dashboards, tiny text, overlapping screenshot piles |
| Benefit story | A state that visibly proves one outcome | Pair one claim with one materially distinct UI state; annotate in HTML outside the image when explanation is needed | Using the same generic dashboard for every feature |
| Workflow | Two to four ordered states from one flow | Preserve sequence and use consistent crop geometry so change is easy to follow | A collage with no reading order |
| Trust/control | Review, permission, audit, routing, or collaboration state | Keep the labels that make the control understandable; pair with specific risk-reduction copy | Cropping away identity/scope cues that are necessary to understand the claim |
| Case study | Before/after state, completed output, or measurable result | Pair with an attributed metric or customer statement only when it is authorized and evidenced | Letting a polished screenshot imply an unsupported outcome |
| Mobile proof | A successfully observed mobile state | Use a portrait capture or phone frame when mobile use is part of the proposition | Shrinking a desktop capture until its controls are unreadable |

A schema 2 pack names each selected capture's role in `pageRole`. Map it directly:

| `pageRole` | Page role |
| --- | --- |
| `hero` | Hero |
| `feature` | Benefit story |
| `workflow` | Workflow |
| `proof` | Trust/control or case study |
| `mobile` | Mobile proof |
| `detail` | Supporting detail below a benefit story |
| `archive` | Not placed on the page |

Place only captures with `selected: true`, and take intrinsic `width` and `height` from the manifest's `dimensions` for the variant you use.

The hero should usually carry one visual idea. Put secondary states below the fold where nearby copy can explain them. Device frames are selective derivatives, not a default treatment for the whole page.

## Build the content map first

For every section using product imagery, record:

| Field | Meaning |
| --- | --- |
| Section | Stable section name or component ID |
| Visitor question | What the audience needs answered here |
| Claim | The exact statement the image supports |
| Asset | Web-facing filename used by the page |
| Source | Screenshot-pack root plus original relative path |
| Evidence status | `source-inferred`, `observed`, `successfully-exercised`, or `blocked` from the pack |
| Treatment | Raw, crop, laptop frame, phone frame, or responsive art direction |
| Reason | Why this state earns its place instead of another candidate |
| Alt text | The user-visible outcome conveyed, or empty when the image is redundant decoration |
| Page role | The pack's `pageRole` for this capture |
| Claim status | `allowed` or `unverified` from the claim register, when one is supplied |

Do not upgrade the pack's evidence status in marketing copy. A screenshot can prove a visible state; it does not by itself prove business impact, speed, reliability, or a completed backend operation.

## Responsive art direction

- Use the pack's desktop, tablet, and mobile captures to select a meaningful state for each layout, not just the same URL.
- Use `<picture>` with breakpoint-specific crops or captures when the narrow layout needs different framing or the product itself changes responsively.
- Use `srcset` and `sizes` when the composition is unchanged and only the delivered resolution should vary.
- Declare intrinsic `width` and `height` so layout space is reserved.
- Keep the hero/LCP asset discoverable in the initial markup, do not lazy-load it, and use high fetch priority only when it is actually the LCP candidate.
- Lazy-load below-fold product captures and avoid loading desktop and mobile art directions simultaneously.
- Prefer WebP or AVIF derivatives when the project pipeline supports them, retaining an appropriate fallback.

Do not optimize away legibility. A smaller transfer is not useful if labels needed to understand the product become unreadable.

## Accessibility

Write alt text for the function the image serves in context, not a transcript of every visible label. When the adjacent heading and copy already express everything the screenshot adds, the framed image may be decorative and use `alt=""`; otherwise describe the visible outcome concisely. Keep explanatory annotations in real HTML whenever possible rather than baking them into pixels.

## Acceptance checks

- The hero product image reinforces the headline and remains understandable at the target viewport.
- Each later screenshot supports a different claim or advances an ordered workflow.
- Selected filenames and source-pack paths resolve, and the original pack remains unchanged.
- No selected asset contains private data, credentials, unintended identity details, internal-only context, or transient loading/error UI.
- The page does not imply that `source-inferred` or merely `observed` behavior was successfully exercised.
- Mobile uses an art-directed state when desktop content would become illegible.
- Informative screenshots have useful alternatives; decorative frames do not create screen-reader noise.
- Hero and below-fold images follow distinct loading priorities.

## Research basis

Reviewed 2026-09-10:

- [Unbounce landing-page best practices](https://unbounce.com/landing-page-articles/landing-page-best-practices/) says each image should have a conversion job and specifically recommends real software screenshots and relevant device mockups.
- [Unbounce SaaS demo landing-page guidance](https://unbounce.com/landing-pages/saas-demo-landing-page-best-practices/) emphasizes aligning high-intent traffic, setting expectations, and supporting the CTA with substantial relevant proof.
- [web.dev responsive image guidance](https://web.dev/articles/serve-responsive-images) recommends appropriate image candidates through `srcset` and `sizes` to reduce unnecessary transfer and improve LCP.
- [web.dev responsive-image delivery guidance](https://web.dev/learn/design/responsive-images) recommends intrinsic dimensions, eager loading for the hero, lazy loading below the fold, and sparing use of high fetch priority for an important/LCP image.
- [MDN on `<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture) describes art direction with alternate sources for different display scenarios.
- [W3C WAI decorative-image guidance](https://www.w3.org/WAI/tutorials/images/decorative/) recommends empty alt text when an image adds no information beyond nearby content.
