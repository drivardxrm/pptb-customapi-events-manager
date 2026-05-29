---
name: "npm-main-built-entry-html"
description: "Keep npm packages from auto-publishing a source root index.html by pointing main at the built dist HTML entry."
domain: "packaging"
confidence: "high"
source: "manual"
---

## When to use

- A package publishes a built SPA from `dist/`, but `npm pack --dry-run` still shows a repo-root `index.html`
- `package.json` has a `files` whitelist, yet npm includes an unexpected extra file
- The manifest `main` currently points at a source HTML file instead of the built artifact

## Pattern

1. Run `npm pack --dry-run` to confirm which files npm will publish.
2. Check `package.json` `main`; npm auto-includes that path even if it falls outside the `files` whitelist.
3. If the published entry should be the built app shell, point `main` to `dist/index.html` (or the equivalent built artifact) instead of the repo-root source HTML.
4. Re-run `npm pack --dry-run` and confirm the root source HTML disappeared while the built `dist/index.html` remains.

## PPTB Example

- This repo already whitelisted only `dist` and `npm-shrinkwrap.json`, but `npm pack --dry-run` still included the repo-root `index.html`.
- Root cause: `package.json` declared `"main": "index.html"`, and npm auto-shipped that file.
- Fix: change `main` to `dist/index.html`; the package kept the intended PPTB entrypoint and stopped publishing the extra source HTML.

## Anti-Patterns

- Do not rely on `.npmignore` alone when `main` still points at the file you want excluded.
- Do not delete the repo-root Vite `index.html`; it is still needed for local build/dev workflows.
