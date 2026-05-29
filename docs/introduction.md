# Introduction

Custom API & Events Manager is a **Power Platform ToolBox** app for working with Dataverse Custom APIs and Business Events without leaving a focused management workspace.

It runs inside the PPTB host application, uses the active Dataverse connection from the host, and layers a React-based UI over Dataverse Web API operations.

## Who it is for

- **Dataverse developers** creating actions, functions, parameters, and response contracts
- **Solution architects** organizing APIs and business events into deployable solutions
- **Integration builders** testing execution payloads, bindings, and outputs before shipping

## Main navigation areas

### Custom API Manager

The Custom API Manager is the authoring surface for Custom APIs and their payload definitions.

- Browse APIs with solution-aware and managed-state filters
- Create and edit Custom APIs
- Create and edit request parameters and response properties
- Toggle a compact tree view for Custom API details
- Jump from Business Event assignments back to the linked Custom API

### Custom API Tester

The tester is the execution surface for validating Custom APIs against a live Dataverse environment.

- Select a Custom API and build a request from generated input controls
- Handle bound and unbound APIs, including entity-bound execution
- Preview the outgoing request object before execution
- Review structured response data, raw OData details, and execution timing
- Surface missing required parameters before execution

### Business Event Manager

The Business Event Manager focuses on Dataverse Catalogs and Catalog Assignments.

- Browse root catalogs with managed-state filtering
- Create root catalogs and nested categories
- Create, edit, and remove catalog assignments
- Inspect catalog trees and assignment details side by side
- Open linked Custom APIs directly in the manager or tester flows

## Settings and diagnostics

The app also includes operational surfaces beyond the three primary nav areas:

- **Settings** for defaults, selector initialization, debug visibility, and layout preferences
- **Logs** for runtime event history
- **Debug Mode** for a live Zustand store viewer and TanStack Query Devtools

Continue with [Installation](/installation) or jump straight to [Usage](/usage).
