// Pure helpers for recording behind a login. Credentials are referenced as ${secret:NAME} and resolved
// from the environment or .env.local at run time; they never appear in logs, capture.json or video.

const SECRET = /\$\{secret:([A-Z0-9_]+)\}/g;

// Returns the steps with secrets filled in, plus the list of names used (for error messages only).
export function resolveSecretSteps(steps, lookup) {
  const used = new Set();
  const resolved = (steps || []).map((step) => {
    if (typeof step.text !== 'string') return step;
    const text = step.text.replace(SECRET, (_, name) => {
      used.add(name);
      const value = lookup(name);
      if (!value) throw new Error(`Login needs ${name}; set it in the environment or .env.local.`);
      return value;
    });
    return { ...step, text, secret: step.secret || SECRET.test(step.text) };
  });
  return { steps: resolved, names: [...used] };
}

// A description of a step that is safe to print.
export function describeStep(step) {
  if (step.do === 'type') return `type into ${step.selector} (${step.secret || /secret:/.test(step.text) ? 'hidden' : `${step.text.length} chars`})`;
  return `${step.do} ${step.selector || step.url || ''}`.trim();
}

// Write paths allowed through read-only mode, as glob patterns on the URL path ("/api/auth/*").
export function writeAllowed(pathname, patterns = []) {
  return patterns.some((pattern) => {
    const regex = new RegExp(`^${pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
    return regex.test(pathname);
  });
}

// Recording a logged-in app is only allowed in an account the owner confirms holds no real customer
// data (a demo tenant, staging, or a local isolated build).
export function assertAuthAllowed(auth) {
  if (!auth) return;
  if (auth.demoAccountConfirmed !== true) {
    throw new Error('promo.json auth.demoAccountConfirmed must be true: record only a demo or staging account with no real customer or personal data.');
  }
}
