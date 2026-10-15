// Generic form-login adapter: drives the app's own sign-in form in a browser.
// Use it for apps where you cannot import the app's code, or as the first draft of a new adapter.
// It does not seed anything; seed personas with the app's own fixture or seed command first.
//
// adapterOptions:
//   loginPath          default '/login'
//   emailSelector      default 'input[type=email], input[name=email]'
//   passwordSelector   default 'input[type=password]'
//   submitSelector     default 'button[type=submit]'
//   passwordEnvVar     name of the environment variable holding the shared fixture password
//                      (default CAPTURE_PERSONA_PASSWORD); never put the value in the config file
//   afterLoginPattern  regex the URL must match once signed in (default: anything but loginPath)
export const name = 'ui-login';

export async function seed(ctx) {
  console.log(`ui-login adapter does not seed. Seed ${ctx.config.product} personas with its own fixture command.`);
}

export async function signIn(persona, ctx) {
  const options = ctx.options;
  const loginPath = options.loginPath || '/login';
  const variable = options.passwordEnvVar || 'CAPTURE_PERSONA_PASSWORD';
  const password = persona.passwordEnvVar ? process.env[persona.passwordEnvVar] : process.env[variable];
  if (!password) throw new Error(`Set ${persona.passwordEnvVar || variable} to the fixture persona password.`);
  const { chromium } = await ctx.kit.loadPlaywright();
  // The login page loads the app's trackers too: block egress at the resolver, for service workers and
  // at the route level before the first navigation, exactly as newPage() does.
  const browser = await chromium.launch({ args: ctx.kit.egressLaunchArgs(ctx.config) });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await ctx.kit.blockEgress(context, ctx.config);
    const page = await context.newPage();
    await page.goto(ctx.origin + loginPath, { waitUntil: 'domcontentloaded' });
    await page.locator(options.emailSelector || 'input[type=email], input[name=email]').first().fill(persona.email);
    await page.locator(options.passwordSelector || 'input[type=password]').first().fill(password);
    await page.locator(options.submitSelector || 'button[type=submit]').first().click();
    const done = options.afterLoginPattern ? new RegExp(options.afterLoginPattern) : null;
    await page.waitForURL((url) => (done ? done.test(url.pathname) : !url.pathname.startsWith(loginPath)), { timeout: 30000 });
    return await context.storageState();
  } finally {
    await browser.close();
  }
}
