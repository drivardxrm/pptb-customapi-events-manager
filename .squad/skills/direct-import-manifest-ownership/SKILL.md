---
name: "direct-import-manifest-ownership"
description: "Fix frontend builds by declaring directly imported packages in package.json instead of relying on transitive dependencies."
domain: "frontend-dependencies"
confidence: "high"
source: "manual"
---

## When to use

- A React/Vite/TypeScript app imports a package directly, but that package only arrives through another dependency's dependency tree.
- Builds or installs start failing after a transitive dependency changes packaging, version, or install state.
- Runtime or bundler errors point into `node_modules` for a package the app imports itself.

## Pattern

1. Search the app for direct imports of the failing package.
2. If the app imports it directly, add that package to `dependencies` in `package.json` with the validated version range you intend to support.
3. Refresh the install so the declared package is rehydrated cleanly in `node_modules`.
4. Run the narrowest meaningful validation command, usually the project build.

## PPTB Example

- `src/components/` and `src/models/` import `@fluentui/react-icons` directly.
- The manifest relied on `@fluentui/react-components` pulling icons transitively, and the local install ended up missing `node_modules\@fluentui\react-icons\lib\icons\chunk-*.js`.
- Adding `@fluentui/react-icons: "^2.0.328"` to `package.json`, reinstalling, and running `npm run build` restored the missing chunk files and cleared the unresolved import failure.

## Anti-Patterns

- Do not paper over missing dependency ownership with Vite aliases or source rewrites when the app already imports the package by name.
- Do not assume a missing file in `node_modules` means the published package is broken; verify the tarball or reinstall first.
