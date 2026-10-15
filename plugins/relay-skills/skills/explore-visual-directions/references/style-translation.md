# Style Translation

Use this reference to turn a named aesthetic, vague vibe, or external style library into a product-specific exploration without copying a generic theme wholesale.

## Source precedence

Use sources in this order:

1. the target product's brand system, tokens, component library, and accessibility requirements;
2. official documentation for a named platform system such as Material, Fluent, Polaris, Carbon, or USWDS;
3. traceable historical or contemporary references for a design movement;
4. curated style catalogs and examples;
5. clearly labeled inference when stronger evidence is unavailable.

Do not present a community catalog as the official specification for a platform design system. Preserve links and distinguish sourced facts from proposed values.

## Resolve the direction

Capture a compact style packet:

- **Interpretation**: the exact style or blend being explored.
- **Signature moves**: one or two repeated treatments that make the direction recognizable.
- **Structural base**: the existing product system that continues to carry layout and interaction.
- **Material layer**: color, surface, depth, border, radius, type expression, imagery, texture, and motion changes.
- **Confusable neighbors**: nearby styles that would materially change the result.
- **Accessibility corrections**: contrast, transparency, motion, focus, density, and fallback needs.
- **Evidence**: sources used and any design judgments that remain proposals.

When the user supplies only a mood, shortlist at most three directions that differ in a way they can actually evaluate. Ask one question only when choosing the wrong neighbor would materially waste the preview.

## Translate, do not transplant

Never paste a catalog's full token set over an established product. Map the style packet to the product's semantic roles:

| Product role | Exploration question |
| --- | --- |
| Canvas | What background treatment makes the material visible without reducing readability? |
| Primary surface | How does the signature move appear on ordinary working surfaces? |
| Elevated surface | How do dialogs, menus, or overlays distinguish depth? |
| Text | Which existing text roles need stronger contrast or opacity? |
| Brand action | How does the canonical primary action remain recognizable? |
| Semantic states | Can success, warning, and danger remain semantic rather than decorative? |
| Focus | Is focus visible without relying on transparency, glow, or motion? |
| Dense content | Which tables, editors, or long-form areas should remain opaque? |

Propose a token delta with an explicit mapping to existing roles. New values remain exploration tokens until a separate implementation decision adopts them.

## Glass treatment packet

Use this packet when the user asks for glass, frosted glass, or glassmorphism. Disambiguate only when they may instead mean refractive Liquid Glass or glossy nature-heavy Frutiger Aero.

**Signature moves**

- translucent raised surfaces over an opaque, visually active canvas;
- backdrop blur paired with a restrained border or inner highlight so surface edges remain legible.

**Product-safe application**

- Start with navigation, secondary panels, menus, and dialogs.
- Keep tables, editors, long-form text, and critical forms on opaque or near-opaque surfaces.
- Use no more than two glass elevations over one opaque base.
- Preserve the product's canonical primary color and semantic state colors.
- Prefer a glass-accent exploration for data-dense or operational products.

**Required corrections**

- Measure text contrast against the composited backdrop, including imagery or gradients beneath the panel.
- Provide a solid fallback when backdrop filtering is unsupported.
- Respect reduced-transparency preferences where the target platform exposes them.
- Keep focus indicators and critical state cues solid and high-contrast.
- Avoid blur-heavy animations and stacked translucent surfaces.

## External reference note

The workflow and glass packet were informed in part by the MIT-licensed `design-language` package in `ara-mkr/claude-artisan`, reviewed at commit `ae6d3add319e7be885f8b02fc0feec8085b0bfc1`. That package is a reference source, not a runtime dependency or authority. Recheck its current contents and license before copying any future material. Its community-authored platform descriptions and generated token values still require independent review.
