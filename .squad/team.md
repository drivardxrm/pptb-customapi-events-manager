# Squad Team

## Project Context

**Project:** PPTB Dataverse Custom API Manager
**Description:** A Power Platform ToolBox (PPTB) tool - React SPA for managing Dataverse Custom APIs and Business Events
**Tech Stack:** React, TypeScript, Vite, Zustand, TanStack Query, Fluent UI v9
**User:** David Rivard

## Members

| Name | Role | Owns | Badge |
|------|------|------|-------|
| Ripley | Lead | Scope, architecture, code review | 🏗️ Lead |
| Dallas | Frontend Dev | React components, UI, Fluent styling | ⚛️ Frontend |
| Kane | Backend Dev | Dataverse services, API layer, data models | 🔧 Backend |
| Lambert | Tester | Tests, quality assurance, edge cases | 🧪 Tester |
| Scribe | Session Logger | Memory, decisions, session logs | 📋 Scribe |
| Ralph | Work Monitor | Work queue, backlog, keep-alive | 🔄 Monitor |

## Architecture Notes

- Host integration via `window.toolboxAPI` and `window.dataverseAPI`
- Zustand for global state (`src/store/useAppStore.ts`)
- TanStack Query for server state with solution-scoped caching
- Entity services extend `EntityService` base class
- Models define Full/Createable/Updateable interfaces plus Lookups
