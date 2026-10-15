# Playwright Capture Playbook

Use this reference for authenticated crawling, responsive capture, and browser evidence hygiene.

## Choose the browser path

Prefer, in order:

1. An existing repository Playwright fixture or demo mode that safely creates the required state.
2. A named Playwright CLI session with interactive headed login.
3. A user-supplied storage-state path kept outside the pack and repository.

Do not create a production-visible demo switcher or seed remote data merely to obtain screenshots. If the target state requires a mutation, use a local/staging fixture or obtain explicit authority for the exact action.

## CLI setup

Verify the prerequisite and point `PWCLI` at the Playwright CLI wrapper available in your environment (for example, the one a Playwright skill installs). If none is available, use the repository's own Playwright setup instead:

```bash
command -v npx >/dev/null 2>&1
export PWCLI="<path to your Playwright CLI wrapper>"
export PLAYWRIGHT_CLI_SESSION="marketing-<product-slug>"
```

Open the target headed when login or visual review is required:

```bash
"$PWCLI" open https://example.com --headed
"$PWCLI" snapshot
```

Ask the user to complete login interactively when credentials or MFA are not already available through an approved fixture. Continue in the same named session. Never print or persist passwords, MFA codes, cookies, or tokens.

## Build an observed flow map

For each candidate flow:

1. Navigate to the entry point and take a fresh accessibility snapshot.
2. Record the title, main heading, primary actions, and current state.
3. Follow only in-scope interactions. Re-snapshot after navigation, modals, responsive menus, tab changes, or substantial DOM updates.
4. Record console errors and failed application requests that could invalidate the visual state.
5. Mark whether the flow was observed, successfully exercised, or stopped before a mutation.

Do not infer a successful operation merely because its button exists.

## Stabilize the capture

Before each screenshot:

- wait for an app-specific ready element or stable state
- wait for `document.fonts.ready`
- ensure lazy content needed for the image is rendered
- close accidental menus, devtools overlays, password prompts, cookie banners, and focus rings unless they are part of the story
- use deterministic demo data and dates when the product supports them
- pause or disable animation only when doing so does not change the product meaning
- avoid relying exclusively on `networkidle` in apps with polling or streaming

If caret suppression changes hydration or rendering, capture with Playwright's `caret: "initial"`. Treat screenshots as visual evidence only after the expected DOM state and absence of material page/request failures are also checked.

## Responsive loop

For every selected state, capture the requested breakpoint set. Example CLI loop:

```bash
"$PWCLI" resize 1440 1000
"$PWCLI" snapshot
"$PWCLI" screenshot

"$PWCLI" resize 834 1112
"$PWCLI" snapshot
"$PWCLI" screenshot

"$PWCLI" resize 390 844
"$PWCLI" snapshot
"$PWCLI" screenshot
```

Confirm that navigation, dialogs, tables, sidebars, and sticky controls have actually adopted the intended responsive state. Element references can change after resizing; use the latest snapshot.

When exact filenames or repeatability matter, use the repository's Playwright API/configuration to write directly into the pack's raw folders. Keep capture code task-local or temporary unless the user asked for a maintained test. Do not make a marketing capture script part of the production bundle.

## Raw and derivative rules

- Save the original viewport image before any crop, annotation, blur, or frame.
- Add a full-page archival image only if it helps substantiate the flow.
- Use an element screenshot for a close product detail only when the surrounding context is preserved in another selected image.
- Record any redaction. Do not silently retouch product functionality.
- Store Playwright traces and raw browser logs under `evidence/`, not among selected marketing assets.
- If a capture fails or shows stale data, retain it only as diagnostic evidence and exclude it from the selected sequence.
