// Relay reference adapter: Better Auth email sign-in, Prisma seeding, Turnstile test mode.
//
// Kit helpers arrive as ctx.kit (make-personas.mjs), so this file can be copied anywhere.
// Preconditions (see references/adapters.md, "Relay"):
//   - config.appRoot is a Relay checkout with its own node_modules, built and served on config.origin
//     with the isolated environment block (throwaway local Postgres, Turnstile always-pass test keys).
//   - DATABASE_URL in this process points at the same throwaway database the server uses.
// Persona fields used: id, name, email, role ('owner' | 'admin' | 'member'), org (adapterOptions
// organizations[].key, the active workspace), extraOrgs (more workspace keys; the org switcher only
// renders with two or more), superadmin (boolean), onboarded (defaults to true when the persona has an org).
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const name = 'relay';

// Cloudflare's documented always-pass Turnstile response; accepted only with the matching test secret.
const TURNSTILE_TEST_RESPONSE = ['XXXX', 'DUMMY', 'TOKEN', 'XXXX'].join('.');
const PERSONA_PASSWORD = 'CaptureFixture!2026';

function userIdOf(persona) {
  return `capture-${persona.id}`;
}

async function loadAppModules(appRoot) {
  const require = createRequire(path.join(appRoot, 'package.json'));
  const { prisma } = await import(pathToFileURL(path.join(appRoot, 'src/lib/prisma.js')).href);
  const { hashPassword } = await import(pathToFileURL(require.resolve('better-auth/crypto')).href);
  return { prisma, hashPassword };
}

export async function seed(ctx) {
  // Relay's Prisma client switches to the AWS IAM pool when storage is enabled, whatever DATABASE_URL
  // says, so refuse outright rather than trust the URL.
  if (/^(1|true|yes|on)$/i.test(String(process.env.RELAY_STORAGE_DB_ENABLED || '').trim())) {
    throw new Error('Refusing to seed: RELAY_STORAGE_DB_ENABLED is set, so the app would use the AWS database.');
  }
  ctx.kit.assertThrowawayDatabase();
  if (!ctx.appRoot) throw new Error('Set appRoot in the pack config to the Relay checkout the server runs from.');
  const { prisma, hashPassword } = await loadAppModules(ctx.appRoot);
  const organizations = Object.fromEntries((ctx.options.organizations || []).map((org) => [org.key, org]));
  const now = new Date();
  const passwordHash = await hashPassword(PERSONA_PASSWORD);
  try {
    for (const org of Object.values(organizations)) {
      await prisma.organization.upsert({
        where: { id: org.id },
        update: {},
        create: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          industry: org.industry || 'Software',
          description: org.description || 'Fixture workspace for design capture.',
          website_url: org.website || 'https://example.com',
          created_at: now,
          onboarded_at: now,
        },
      });
    }
    for (const persona of ctx.config.personas.filter((item) => item.id !== 'anon')) {
      const id = userIdOf(persona);
      const org = persona.org ? organizations[persona.org] : null;
      const onboarded = persona.onboarded ?? Boolean(org);
      const [firstName, ...rest] = String(persona.name || persona.id).split(' ');
      await prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: persona.name || persona.id,
          email: persona.email,
          emailVerified: true,
          firstName,
          lastName: rest.join(' ') || null,
          isSuperAdmin: Boolean(persona.superadmin),
          onboardingStep: onboarded ? 'complete' : null,
          jobFunction: org ? 'Marketing' : null,
        },
      });
      await prisma.account.upsert({
        where: { id: `acct-${id}` },
        update: {},
        create: { id: `acct-${id}`, accountId: id, issuer: 'local:credential', providerId: 'credential', userId: id, password: passwordHash },
      });
      const memberships = [org, ...(persona.extraOrgs || []).map((key) => organizations[key])].filter(Boolean);
      for (const membership of memberships) {
        const memberId = membership === org ? `mem-${id}` : `mem-${id}-${membership.key}`;
        await prisma.member.upsert({
          where: { id: memberId },
          update: {},
          create: { id: memberId, organization_id: membership.id, user_id: id, role: persona.role || 'member', created_at: now },
        });
      }
    }
    // Populated states: add product records here, or run the app's own fixture seeders against the
    // same database. Keep ids prefixed "seed-" and names obviously fictional.
  } finally {
    await prisma.$disconnect();
  }
}

export async function signIn(persona, ctx) {
  const { request } = await ctx.kit.loadPlaywright();
  const api = await request.newContext({ baseURL: ctx.origin, extraHTTPHeaders: { origin: ctx.origin } });
  try {
    // Better Auth rate-limits sign-in per IP in production builds; back off on 429.
    const signInResponse = await ctx.kit.with429Retry(() => api.post('/api/auth/sign-in/email', {
      headers: { 'x-captcha-response': TURNSTILE_TEST_RESPONSE },
      data: { email: persona.email, password: PERSONA_PASSWORD, rememberMe: true },
    }));
    if (!signInResponse.ok()) {
      throw new Error(`Sign-in failed for ${persona.id}: HTTP ${signInResponse.status()} ${(await signInResponse.text()).slice(0, 200)}`);
    }
    const org = persona.org ? (ctx.options.organizations || []).find((item) => item.key === persona.org) : null;
    if (org) {
      const activeResponse = await api.post('/api/auth/organization/set-active', { data: { organizationId: org.id } });
      if (!activeResponse.ok()) throw new Error(`set-active failed for ${persona.id}: HTTP ${activeResponse.status()}`);
    }
    return await api.storageState();
  } finally {
    await api.dispose();
  }
}
