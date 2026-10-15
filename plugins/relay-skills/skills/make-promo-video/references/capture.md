# Capture

## How recording works

- **Live shots** use a Chrome DevTools screencast, not Playwright's `recordVideo`. `recordVideo`
  records at 1x device pixels and roughly 0.5 Mbit/s, which is too soft to zoom into. Headless
  Chromium's screencast ignores the context `deviceScaleFactor` but honours the launch flag
  `--force-device-scale-factor`, which `launchCapture()` sets from `captureScale` (default 2), so a
  1280×720 viewport yields 2560×1440 frames.
- The screencast only emits a frame when the page repaints (about 20–25 fps during motion, none when
  static). Each frame is saved with its timestamp and the renderer shows the latest frame at or
  before each output instant, so still periods hold correctly.
- Every step is logged with its time and the element's viewport box. The renderer draws the cursor
  gliding between logged points, a click ripple, and zooms to hovered, clicked and typed-into
  elements. **The recorded pixels are never edited.**
- **Still shots** are full-page screenshots at `captureScale` (the context gets the scale factor for
  screenshots). The page is scrolled once first so on-scroll content renders. Camera moves over a
  still are perfectly smooth, so prefer stills for "tour the page" shots and live shots for
  interaction.

## Boundary

`newCaptureContext()` applies, in order: service workers blocked, requests and WebSockets to any
other host aborted, and (read-only mode) writes to the product aborted. `launchCapture()` adds the
resolver rules. `capture.json` lists every blocked host and write, and `qa.mjs` reports them. On
relay.builtbyrose.co the only blocked write was `POST /monitoring` (the site's error-reporting
tunnel), which is what read-only mode is for.

Read-only mode stays on for every project. Signing in is handled by `login.mjs`, and the sign-in
POST is allowed through `auth.allowWrites` (see `auth.md`); nothing else may write to the product.

## Selectors and timing

- Use Playwright selectors: `text=…`, `h3:text-is('…')`, `button:text-is('Search')`,
  `input[placeholder^='…']`. Probe them with a quick capture of one shot (`--only <shotId>`).
- Put waits in the steps (`holdMs`, `settleMs`), not in the timeline: `timeline.mjs` spreads any
  extra shot time as holds right after hovers, clicks and typing, and speeds a long capture up to
  1.6x. A shot whose capture is much longer than its lines is trimmed and reported.
- Typing is paced (`delayMs`, default 75 ms per key) so it reads on screen.
