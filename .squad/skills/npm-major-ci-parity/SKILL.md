# NPM Major CI Parity

## When to use
- `npm ci` fails in GitHub Actions even though `package.json` and `package-lock.json` were freshly generated locally.
- The failure lists "Missing" packages from the lock file that look unrelated to the most recent dependency change.
- Local installs succeed on one machine but fail on the runner.

## Pattern
1. Check which npm major generated the current lockfile in practice by running a clean `npm ci` locally.
2. Reproduce with the runner-equivalent npm major in a clean checkout or worktree.
3. If one npm major succeeds and the runner npm major fails on the same commit, classify it as **workflow/config drift** rather than generic lock drift.
4. Fix by pinning CI to the intended npm major (and ideally recording that expectation in repo metadata), not by blindly churning the lockfile.
5. Review every sibling workflow that also runs `npm ci`; they are usually affected together.

## Repo example
- `package.json` / `package-lock.json` at commit `5ad36e8` installed successfully with npm 11.
- `.github/workflows/docs.yml` failed on GitHub because Node 22 provided npm 10.x on the runner.
- `.github/workflows/e2e-tests.yml` is a sibling risk because it also runs `npm ci`.

## Validation checklist
- [ ] Reproduce the failing `npm ci` with the runner npm major.
- [ ] Confirm the same commit installs cleanly with the authoring npm major.
- [ ] Run the narrow target command after install (`npm run docs:build`, test command, etc.).
- [ ] Search the repo for other `npm ci` workflows and flag them as follow-up scope.
