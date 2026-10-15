# Route discovery

The goal is a complete list of routes, each with the evidence for how a user reaches it. Missing a
route means a page the redesign never sees. Keeping a dead route means designing something nobody uses.

## From source (preferred)

`discover-routes.mjs` reads framework route files. What each framework contributes:

| Framework | Route files | Ignored |
|---|---|---|
| Next.js app router | `app/**/page.(js,jsx,ts,tsx,mdx)` (also under `src/`) | `(group)` folders collapse, `@slot` parallel routes collapse, `_private` folders and `(.)` intercepting routes skip |
| Next.js pages router | `pages/**/*.(js,jsx,ts,tsx,mdx)` | `api/`, `_app`, `_document`, `_error`, `404`, `500` |
| SvelteKit | `src/routes/**/+page.svelte` | `(group)` folders collapse |
| Remix (flat routes) | `app/routes/*` | `_index`, pathless `_layout` segments, resource routes |
| Nuxt | `pages/**/*.vue` | |
| Astro | `src/pages/**/*.(astro,md,mdx)` | |

For other stacks, read the router definition directly (Rails `config/routes.rb`, Django `urls.py`,
Laravel `routes/web.php`, React Router config objects, Angular route arrays) and write `routes.json`
in the same shape by hand: `[{ "route": "/billing", "dynamic": false, "file": "..." }]`.

Also read, because they change what a user actually lands on:

- **Redirects and rewrites** in framework config and middleware (Next.js `redirects()` and
  `middleware`, server rewrites, CDN rules). A route with a page file can still be unreachable.
- **Auth guards and role checks** in layouts and middleware. They decide which persona sees what.
- **Feature flags** that hide whole routes. Record the flag and capture both sides when you can.

## Without source

`crawl-links.mjs` walks same-origin links breadth-first from `/` as one persona. It collapses
numeric and id-like segments to `[id]`, keeps the first concrete URL as a sample, and records every
link edge. Crawl once per persona that sees different navigation (anon and owner at least). A crawl
only finds linked pages, so it cannot find orphans by itself; add sitemap URLs and any routes the
team knows about.

## Dynamic routes

A dynamic route (`/agents/[id]`) is captured through samples in `dynamicSamples`. Choose samples that
show different states of the same template: a complete record, an empty one, a failed one, one owned
by someone else. A dynamic route with no sample is a coverage gap, not a silent skip; `baseline.mjs`
lists them.

## Reachability classes

`find-orphans.mjs` combines three kinds of evidence:

- **nav**: the route appears in a navigation source file (header, sidebar, avatar menu, footer).
  Point `navSources` at those files.
- **linked**: another source file references the route as a string literal, or a captured page links
  to it (baseline and crawl link graphs).
- **redirect**: every baseline capture of the route ended on another URL.

A route with none of these is an **orphan**. An orphan whose file has not changed for a long time
(default 120 days, from `--git` history) is a **legacy candidate**. Both are leads to check, not
verdicts: a route reached only from an email, an OAuth callback, an embed or a support article is
legitimate. Confirm with `git log --follow` on the route file and a search for the path in
templates and emails before calling it dead.

## Areas

Group routes by the product's own navigation groups (for example Public, Onboarding, Workspace,
Library, Settings, Billing, Admin). Put a route in the area where users reach it, not where its code
lives. Aim for 5–15 routes per area so one agent can finish an area in one pass and one design-tool
upload covers it.
