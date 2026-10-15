---
name: explore-visual-directions
description: Create a reviewable visual-style exploration for an existing product, page, or interface before implementation. Use when someone asks to see how a current experience would look in a named aesthetic or described vibe, such as glassmorphism, editorial, brutalist, retro, premium, playful, or futuristic. Produces an isolated preview or implementation-ready visual specification without replacing the established brand system or changing production.
license: MIT
metadata:
  owner: rose
---

# Explore Visual Directions

Turn “show me this product in glass” into a concrete, reversible comparison that a team can inspect before deciding whether to implement it.

## Preserve the decision boundary

This skill authorizes analysis and the deliverables the user requested. It does not authorize changing shared design tokens, rewriting production components, committing, deploying, or activating a new theme.

- Existing brand documentation, tokens, accessibility rules, and product identity are authoritative.
- Treat named-style catalogs and examples as references, not as permission to replace the product's system.
- Build an isolated preview only when the user asked for a working preview and the environment supports one.
- Otherwise return a visual direction brief detailed enough for a separate implementation task.
- If the user later chooses a direction, treat implementation as a new scoped decision.

## Choose the output mode

Use the smallest mode that answers the request:

- **Direction brief**: mood, signature treatment, token delta, component mapping, and risks. Use when code or a target surface is unavailable.
- **Isolated preview**: a namespaced theme, temporary route, story, mockup, or other reversible surface plus comparison evidence. Use when the user asks to see the direction and implementation tools are available.
- **Comparison set**: two or three meaningfully different directions using the same baseline content. Use when the user is choosing among alternatives.

Do not turn an exploration request into a production redesign.

## Gather the minimum context

Before proposing the treatment, identify:

1. the exact surface or flow to preserve;
2. the audience and job performed on that surface;
3. the current brand source of truth and token/component boundaries;
4. the requested style, vibe, era, or material treatment;
5. whether the user wants a brief, a working preview, or alternatives;
6. the devices and accessibility constraints that matter.

Inspect the real interface, source, or screenshots when available. If the style label has multiple plausible meanings, ask one focused disambiguating question or state the interpretation used.

## Translate the style without erasing the product

Read [references/style-translation.md](references/style-translation.md) when resolving a named style, vague vibe, or external style reference.

Separate the design into two layers:

- **Product invariants**: information architecture, content, interaction behavior, brand marks, semantic states, type roles, density needs, and accessibility requirements.
- **Exploration layer**: surface material, palette adjustments, depth, borders, radii, typography expression, imagery, texture, and motion.

For an established product, prefer a restrained material or accent treatment first. A full reskin is appropriate only when the user explicitly asks for one and the comparison remains isolated.

## Build a reversible preview

Read [references/preview-and-evidence.md](references/preview-and-evidence.md) before editing code or producing a rendered comparison.

When implementation is authorized:

- preserve the baseline and use a dedicated route, story, fixture, branch, or namespaced theme;
- reuse the existing component structure and content so the comparison isolates visual direction;
- keep exploratory tokens namespaced and separate from canonical tokens;
- avoid broad shared-component edits unless isolation is impossible and the user approves that scope;
- support keyboard access, focus visibility, reduced motion, responsive layouts, and style-specific fallbacks;
- verify the actual rendered foreground/background combinations, not token values in isolation.

If a real preview cannot be produced, say so and return the direction brief rather than claiming visual verification.

## Deliver a decision package

Return only the artifacts relevant to the request. For a complete exploration, include:

- **Baseline**: the surface and product behavior held constant.
- **Direction**: the chosen style interpretation and its one or two signature moves.
- **Preview**: a link, file, or before/after images when rendered.
- **Token delta**: proposed exploration values mapped to existing semantic roles; do not present them as adopted canonical tokens.
- **Component map**: how navigation, controls, forms, cards, tables, dialogs, feedback, and empty/loading states express the direction.
- **Qualification**: viewport coverage, contrast, focus, reduced-motion/transparency behavior, and any unverified gaps.
- **Tradeoffs**: where the style helps, where it harms legibility or product density, and what should remain unchanged.
- **Decision**: recommend adopt, revise, or reject, with the next separately authorized step.

Keep implementation, local visual qualification, deployment, live verification, and human acceptance separate.
