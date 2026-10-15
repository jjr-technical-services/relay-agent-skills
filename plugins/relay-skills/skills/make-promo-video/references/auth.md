# Recording behind a login

Record signed-in pages only in an account the owner confirms holds **no real customer or personal
data**: a demo workspace, staging, or a local isolated build with fixtures (map-site-for-redesign's
environment). Never a production tenant.

## promo.json

```json
"auth": {
  "loginUrl": "/login",
  "successSelector": "h1:text-is('Dashboard')",
  "successUrl": "/app",
  "checkUrl": "/app",
  "demoAccountConfirmed": true,
  "allowWrites": ["/api/auth/*"],
  "allowHosts": ["accounts.google.com"],
  "maxAgeHours": 12,
  "steps": [
    { "do": "type", "selector": "input[name=email]", "text": "${secret:PROMO_LOGIN_EMAIL}" },
    { "do": "type", "selector": "input[type=password]", "text": "${secret:PROMO_LOGIN_PASSWORD}" },
    { "do": "click", "selector": "button[type=submit]" }
  ]
}
```

## Signing in

- **Headed (recommended):** `node scripts/make.mjs login --project <dir> --headed` opens a visible
  browser; the person signs in (SSO, MFA and captchas work because a human does them). The kit never
  sees a password. Identity-provider hosts in `allowHosts` are reachable during login only.
- **Scripted:** `node scripts/make.mjs login --project <dir>` runs `steps`. `${secret:NAME}` is read
  from the environment or `.env.local` at run time and typed with `fill()`; logs show "(hidden)".
  Never put a credential in promo.json, the storyboard, a prompt or chat.
- `--check` verifies the saved session still reaches a signed-in page.

The session is stored at `<project>/.auth/state.json` with owner-only permissions (and a `.gitignore`).
Delete it when the video is done. Capture refuses to record signed-in shots without it, warns when it
is older than `maxAgeHours`, and records `signedIn` per shot in `capture.json`.

## Writes while signed in

Signing in and recording both stay behind the write block: the product only receives the POST/PUT/
PATCH/DELETE paths in `allowWrites` (default: common sign-in and session paths). Everything else a
signed-in page fires (analytics, autosave, tracking) is aborted and reported, so recording cannot
change the account. A shot that should show the logged-out site sets `"auth": false`.

In Relay the same contract applies, with the credential held in the workspace vault and the headed
step replaced by the user signing in inside a sandboxed browser session.
