# Preview and Evidence

Read this reference before creating a working visual exploration.

## Isolation choices

Choose the least invasive option supported by the target project:

1. an existing Storybook or component-preview environment;
2. a dedicated design-lab or preview route excluded from ordinary navigation;
3. a standalone fixture that imports real components without changing their defaults;
4. a static mockup using real content when the application cannot run locally.

Use a task-owned branch or worktree when editing a shared repository. Preserve unrelated work and do not deploy an exploration unless the user separately authorizes deployment.

## Namespaced theme contract

- Scope exploratory CSS beneath a deliberate selector such as `[data-visual-direction="glass"]`.
- Prefix new custom properties, for example `--explore-surface-glass`, when they do not map cleanly to existing semantic roles.
- Do not replace canonical root tokens merely to make the preview easy.
- Keep content, layout, states, and data constant between baseline and variant unless a difference is necessary to express the direction.
- Document any shared component change and why isolation could not avoid it.

## Visual qualification

Capture the same states and viewport for baseline and variant:

- primary desktop viewport;
- representative mobile viewport;
- default, hover, focus, active, disabled, loading, empty, and error states relevant to the surface;
- open menus, dialogs, or overlays where the treatment changes elevation;
- light/dark or other supported themes when applicable.

Prefer actual browser screenshots. Label generated concept imagery as a concept and do not present it as a working UI.

## Accessibility and resilience

At minimum verify:

- foreground/background contrast on the rendered composition;
- keyboard reachability and visible focus;
- readable content when transparency, blur, gradients, or background images fail;
- reduced-motion behavior;
- reduced-transparency behavior where supported;
- zoom and responsive reflow;
- critical semantic states without color-only distinctions.

If a check cannot run, list it as an unverified gap. Do not treat a static screenshot as interaction or accessibility proof.

## Decision record

The final comparison should make a review decision easy:

```text
Surface:
Audience and job:
Direction and intensity:
Baseline held constant:
Preview artifacts:
Token delta:
Qualification passed:
Unverified gaps:
Benefits:
Costs and risks:
Recommendation: adopt | revise | reject
Next separately authorized step:
```

Adoption means the direction is worth implementing. It does not mean the preview code, generated tokens, or external catalog values are production-ready.
