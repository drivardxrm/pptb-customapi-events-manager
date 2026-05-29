---
name: "npm-lockfile-ci-version-alignment"
description: "Resolve npm ci lockfile mismatches caused by npm major-version drift between local and CI."
domain: "build-ci"
confidence: "high"
source: "manual"
---

## When to use

- `npm ci` fails in CI with `package.json` / `package-lock.json` out-of-sync errors
- local `npm ci` succeeds
- missing packages in the error look like alternate peer-resolution trees rather than your current direct deps

## Pattern

1. Reproduce with the CI npm major (`npx -y npm@<ci-version> ci`) and with the local npm major.
2. If only the older/newer npm major fails, treat it as toolchain drift instead of regenerating the lockfile blindly.
3. Pin the intended npm version in CI and declare the same version in `package.json` via `"packageManager"`.
4. Re-run the smallest relevant validation, usually `npm ci` plus the failing build command.

## PPTB Example

- CI log showed missing `react@18.3.1`, `react-dom@18.3.1`, `scheduler@0.23.2`, and `@types/react@18.3.29`.
- Repo manifests actually target React 19 and install cleanly with npm 11.
- `npx -y npm@10.9.2 ci` reproduced the failure; `npx -y npm@11.10.0 ci && npx -y npm@11.10.0 run docs:build` passed.
- Fix: add `"packageManager": "npm@11.10.0"` to `package.json` and upgrade npm in `.github/workflows/docs.yml` before `npm ci`.
