# App adapters

Everything in the kit is app-agnostic except the adapter: the module that seeds personas and
fixture data and signs each persona in. `make-personas.mjs` loads it from the pack config
(`"adapter": "adapters/<app>.mjs"`).

## Interface

```js
export const name = 'my-app';
export async function seed(ctx) {}              // idempotent; local throwaway database only
export async function signIn(persona, ctx) {}   // returns a Playwright storageState { cookies, origins }
```

`ctx` is `{ config, origin, appRoot, options }`. `options` is `adapterOptions` from the pack config.
Persona objects come straight from the config, so add whatever fields the adapter needs (role,
workspace key, plan, feature flags).

Kit helpers arrive as `ctx.kit` (`loadPlaywright`, `blockEgress`, `assertThrowawayDatabase`,
`with429Retry`); use them instead of importing `lib.mjs`, so a copied adapter works from any folder.

Rules: refuse non-local databases (`ctx.kit.assertThrowawayDatabase()` also requires the database name
to contain capture, design or throwaway), upsert by fixed ids, label fixtures, never write credentials to
disk except the storageState the kit needs, and never call external services.

Prefer signing in over the app's HTTP auth endpoint with Playwright's `request.newContext()` and
returning `api.storageState()`. It is fast and does not depend on login-page markup. Fall back to
`ui-login.mjs`, which fills the login form, when the auth flow is hard to call directly.

## Relay (reference adapter, `adapters/relay.mjs`)

- **Auth:** Better Auth email and password. `POST /api/auth/sign-in/email` with an `origin` header
  equal to the app origin, then `POST /api/auth/organization/set-active` for personas with a workspace.
- **Captcha:** Turnstile. Serve with Cloudflare's always-pass test secret
  `1x0000000000000000000000000000000AA` and send the dummy response in the `x-captcha-response` header.
- **Seeding:** imports Relay's own Prisma client from `appRoot` and the password hasher from
  `better-auth/crypto`, then upserts organization, user, credential account and membership rows.
  Superadmin is the `isSuperAdmin` user flag; onboarding is `onboardingStep: 'complete'`.
- **Server environment** for the isolated build (values are local test values, not real credentials):

```bash
export DATABASE_URL=postgresql://postgres@127.0.0.1:<pg-port>/capture_relay
export BETTER_AUTH_SECRET=local-design-capture-only-at-least-thirty-two-characters
export BETTER_AUTH_URL=http://localhost:<port> APP_BASE_URL=http://localhost:<port> NEXT_PUBLIC_APP_URL=http://localhost:<port>
export RELAY_STORAGE_DB_ENABLED=0 RELAY_TEST_FIXTURES=1 SESSION_COOKIE_SECURE=false
export TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
export NEXT_TELEMETRY_DISABLED=1
```

- **Flags to set before the server starts:** `RELAY_WORKSTREAM_MAP`, `RELAY_ASK_INBOX`,
  `RELAY_AGENT_OPERATIONS_ENABLED`, `RELAY_WORKFORCE_DIRECTORY`, and the embed flags; re-read source for
  new ones. `/catalog/sponsored` is gated by PostHog and 404s locally without an override.
- **Stubbed states:** with no AI key, readiness checks return "Blocked". The ready, confirm-cost and
  paywall states were reached with `rewriteJson()` and labelled stubbed.
- **Swallowed errors:** `/research` and `/network` render their empty state on 403 and 500.
- **200 not-found:** `/goals/<unknown-slug>` streams a not-found body with status 200.
- **Capture behaviour:** signed-in desktop pages scroll inside `<main>`, so plain full-page shots
  stop at 900 px; the kit's `shot()` handles this. Under `reducedMotion: 'reduce'`, fade-in content
  on `/help` stays invisible, which is an accessibility bug worth a finding.
- **Known gaps:** with no model provider key, live AI runs fail; insert completed run records to show
  populated run and output states. Cookies are not `Secure` locally, so keep the origin on `http://localhost`.

## Writing an adapter for another product

1. **Router:** find its route files and check `discover-routes.mjs --framework` supports them. If not,
   write `routes.json` from its router config.
2. **Auth:** find the sign-in endpoint and whether it needs CSRF, captcha or an origin check. If sign-in
   is a hosted provider (Auth0, Clerk, Cognito, Supabase), use the provider's test mode or a local
   emulator, or sign in once through `ui-login.mjs` against a test tenant.
3. **Access model:** list the real roles and what grants access (workspace membership, purchase,
   allowlist, plan). Map personas to those, not to a workspace template.
4. **Flags and gate keys:** list every flag that gates a route or panel, and every app-level API key
   the build needs, and how to set each locally.
5. **Seeding:** prefer its own seed or fixture command. Import its database client from `appRoot`
   only when no seed command exists, and skip sign-up paths that send email.
6. **Side effects and trackers:** find email, payment, webhook, bot-protection and analytics
   integrations; turn each off, to test mode, or rely on egress blocking.
7. Copy `adapters/template.mjs`, implement `seed` and `signIn` using `ctx.kit`, and run
   `make-personas.mjs` until every persona passes the probe.
