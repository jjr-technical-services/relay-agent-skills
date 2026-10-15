// Adapter template. Copy to adapters/<app>.mjs and implement both functions.
// make-personas.mjs calls seed(ctx) once, then signIn(persona, ctx) for every persona except "anon".
//
// ctx = { config, origin, appRoot, options, kit }
//   config   the loaded pack config (lib.mjs loadConfig)
//   origin   the isolated app origin, for example http://localhost:3191
//   appRoot  the checkout the isolated server runs from (config.appRoot); import the app's own
//            database client or seed helpers from here rather than duplicating its schema
//   options  config.adapterOptions, free-form per app
//   kit      the kit's lib.mjs helpers: loadPlaywright, blockEgress, assertThrowawayDatabase, with429Retry.
//            Use these rather than importing lib.mjs, so the adapter works wherever it is copied.
//
// Rules every adapter must keep:
//   1. Refuse to seed anything that is not a local, throwaway database: call ctx.kit.assertThrowawayDatabase().
//   2. Be idempotent: upsert by fixed ids so a re-run never duplicates rows.
//   3. Label fixture data as fixtures (a demo company name, *.test email domains, a "seed-" id prefix).
//   4. Never create accounts, send email or call third-party services against a shared or production system.
//   5. Return a Playwright storageState ({ cookies, origins }) from signIn; never write credentials to disk.
//   6. Block egress (ctx.kit.blockEgress) on any browser context you open, and back off on 429
//      (ctx.kit.with429Retry): auth endpoints rate-limit per IP.
//   7. Map personas to the product's REAL access model. Workspaces, orgs and a second workspace only
//      apply if the product has them; a product may instead grant access per purchase or allowlist.

export const name = 'template';

export async function seed(ctx) {
  // Example: create the personas' users, their workspace, and enough records for populated states.
  // Also create at least one record per list page that a detail route can open (dynamicSamples).
  throw new Error(`Implement seed() for ${ctx.config.product}.`);
}

export async function signIn(persona, ctx) {
  // Option A (preferred): sign in over the app's HTTP auth endpoint with Playwright's request API,
  //   then return await api.storageState(). See adapters/relay.mjs.
  // Option B: drive the login form in a browser. See adapters/ui-login.mjs.
  throw new Error(`Implement signIn() for persona ${persona.id} on ${ctx.origin}.`);
}
