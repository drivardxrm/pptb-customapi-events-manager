# Routing Rules

## Domain Routing

| Pattern | Route To | Notes |
|---------|----------|-------|
| React, components, UI, styling, Fluent | Dallas | Frontend work |
| Services, Dataverse, API, models, FetchXML | Kane | Backend/data layer |
| Tests, quality, edge cases, validation | Lambert | Testing |
| Architecture, scope, review, decisions | Ripley | Lead oversight |
| Logs, memory, decisions file | Scribe | Silent logging |
| Work queue, backlog, monitoring | Ralph | Work monitor |

## Keyword Triggers

- "component", "hook", "style", "layout" → Dallas
- "service", "entity", "query", "mutation" → Kane
- "test", "verify", "edge case", "QA" → Lambert
- "design", "architecture", "review", "scope" → Ripley

## Review Gates

- Kane's services reviewed by Ripley
- Dallas's components reviewed by Ripley
- All PRs get Lambert test coverage check
