### 2026-05-27T00:00:00Z: Remove `.squad-templates/`
**By:** Dallas (via Copilot)
**Decision:** Delete `.squad-templates/` from the repository, but keep `.github\workflows\squad-promote.yml` references because they still enforce that template content stays out of promoted branches if reintroduced.
**Why:** This satisfies the cleanup request without weakening existing promotion safeguards or touching historical `.squad/` records.
