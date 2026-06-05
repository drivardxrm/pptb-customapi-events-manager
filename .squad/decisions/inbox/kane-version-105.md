# Kane — 1.0.5 Release Prep Decision

**Date:** 2026-06-05  
**Issue:** #74  
**Scope:** Release prep / version bump

## What

Prepared version `1.0.5` by updating the manifest version, aligning `npm-shrinkwrap.json`, and creating an in-repo `CHANGELOG.md` entry for issue #74.

## Why

The release workflows validate that `CHANGELOG.md` contains a `## [<package.json version>]` heading before preview, promote, or release steps can pass. GitHub release notes may be generated at release time, but the changelog file itself must exist and be maintained in the repository.

## Impact

- Keeps release metadata consistent across npm manifests
- Satisfies workflow guards in `.github/workflows/squad-preview.yml`, `.github/workflows/squad-promote.yml`, and `.github/workflows/squad-release.yml`
- Documents the 1.0.5 fix for runtime Dataverse component-type resolution in a durable in-repo changelog
