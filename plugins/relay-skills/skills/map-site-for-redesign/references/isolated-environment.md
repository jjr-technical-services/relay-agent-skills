# Isolated capture environment

Capture needs populated, signed-in states, which means writing data. All writes go to an
environment nobody else depends on.

## Build

1. Make a fresh checkout (or worktree) of the exact revision under review. Record its commit in the
   master brief so the pack is traceable.
2. Give it its own dependency install. Do not share another checkout's dependencies or build cache.
3. Build the production bundle and serve that, not the dev server. Dev servers compile on demand, so
   the first visit to each route is slow and sometimes shows overlays that are not in the product.
4. Turn on every feature flag that gates a surface before the server starts. Read the flag
   checks in source (environment variables, a flag service such as PostHog or LaunchDarkly, plan
   entitlements) and list them in `serverFlags`. Flags served by a remote flag service need a local
   override or a bootstrap value; otherwise the gated route 404s locally and looks dead. Record any
   surface you still cannot turn on as a coverage gap.
5. Set the app's own API gate keys to dummy values before building. Keys the app checks on its own
   routes (for example an internal client API key) are not third-party credentials; without them every guarded
   route 500s before product logic runs, and the pack shows error pages that users never see.
6. Bot protection that depends on the hosting platform can fail under a local production server
   (for example a 503 for a missing platform token) and often bypasses only in development mode.
   Capture those flows on a separate, labelled `next dev` pass, or stub the check with `rewriteJson()`.
7. Serve on a port nothing else uses. Point the app's own base URL settings at that origin so
   redirects and auth callbacks stay local.

## Database

- Create a throwaway database (local Postgres, SQLite file, or a container) and apply the app's
  migrations to it with the app's normal non-destructive migrate command.
- Adapters must refuse to seed when the connection host is not local. The Relay adapter checks this.
- Stop external side effects: no real email, payments, webhooks, AI calls or third-party APIs. Use
  the app's test modes (captcha test keys, payment test mode) or leave the integration unconfigured
  and record the resulting states as they are.
- When several agents capture at once against one server, give each area an id prefix for the rows
  it creates (`kn-`, `adm-`, `work-`), and never restart the shared server or database.
- Make every seed replace only its own rows: delete by its prefix, then insert. Upserts alone are
  not idempotent on append-only tables (messages, events, audit logs), and a re-run doubles them.
- Never change the shared persona session. Switching the active workspace, impersonating, or signing
  out changes the session on the server for every agent using that storageState. An agent that needs
  a different workspace or role signs in as its own persona instead (add one to the config and re-run
  `make-personas.mjs --skip-seed`).

## Fixture data

Populated screens are the ones designers most need, and an empty workspace hides most of the product.

- Invent one coherent fictional customer (for example "Northwind Labs, product analytics for
  retailers") and make every record belong to its story: realistic names, amounts, dates within the
  last few months, a mix of statuses.
- Seed at least one record in every list, one long record (long names, many items) to show
  overflow, and records in each status a list can show (draft, active, failed, archived).
- Seed what dynamic routes need and put those URLs in `dynamicSamples`.
- Where a feature depends on an external service that is off (AI runs, URL capture, uploads to
  cloud storage, payments), intercept the save request in the browser and insert the rows it would
  have produced directly. The spinner and the error banner are still real UI; capture them too, and
  say in the doc which states came from inserted data.
- Label everything as fixture data: `.test` emails, `seed-` ids, no real people, customers or logos.

## Personas

| Persona | Purpose |
|---|---|
| anon | Public pages, logged-out redirects, sign-in and sign-up |
| new | Onboarding, first-run and empty states: no workspace, not onboarded |
| member | Day-to-day use and what a non-admin is denied |
| owner / admin | Settings, billing, team management, the populated product |
| superadmin | Platform administration, if the product has it |

Map the table to the product's real access model before seeding. If there are no workspaces, drop
the workspace rows and use the states access actually depends on (for example Acme: signed out, new
account, abandoned checkout, paying customer with history, admin by email allowlist).

Keep the owner and member personas ordinary users. If the owner is also a superadmin, platform
privileges hide the gating a member hits, so the pack never shows it. Where the product has
workspaces, give the owner a second one: switchers and "choose a workspace" flows only render with
two or more.

Seed users directly (database rows plus a credential account) rather than through the app's sign-up
endpoint when sign-up fires side effects such as a welcome email.

Add personas when roles really change the UI (viewer, billing-only, guest, a second workspace to
show the workspace switcher). `make-personas.mjs` fails if any persona lands on a login page, because
a pack captured with a dead session is all login screens.

## Teardown

Stop only the server and database you started. Keep the database until the pack has been reviewed,
in case states need re-capturing, then delete it.
