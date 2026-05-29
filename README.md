# Custom API & Events Manager for Power Platform ToolBox

**All-in-one workspace for creating, managing, and testing Dataverse Custom APIs and Business Events**

Designed for **Dataverse developers, solution architects, and integration builders** who need to configure, manage and explore Custom APIs and Business Event (Catalogs).


## ✨ Features

### Custom API Manager
- 🔧 **Create & Edit Custom APIs** — Full UI for configuring Custom APIs, Request parameters and Response properties
- 👀 **Browse Custom Apis** — Easily navigate Custom APIs in target environment with relevant filters
- 🏢 **Solution Organization** — Create Custom APIs to solutions for governance and distribution
- 📂 **Tree View Display** — Optional compact tree view layout for viewing Custom API structure

### Custom API Tester
- 🧪 **Execute & Test APIs** — Call Custom APIs directly with real-time execution feedback
- ⚙️ **Dynamic Parameter Input** — Automatically generate parameter input forms based on parameter types (Boolean, DateTime, Entity selection, etc.)
- 📊 **Response Inspection** — View parsed response properties with execution timing metrics
- 🔗 **Entity Record Selection** — For entity-bound APIs, select records from the bound entity
- 🌐 **OData Details** — View raw OData requests and responses
- ⏱️ **Performance Metrics** — Track API execution time

### Business Event Manager
- 👀 **Browse Event Catalog** — Explore available Dataverse Business events (Catalogs) with relevant filters
- 📌 **Manage Catalogs and Assignments** — View, create, and delete Business events (Catalogs / Catalog Assignmenents)


### Settings & Configuration
- 🔧 **Default Publisher** — Set default publisher for new Custom APIs and Business Events (connection-scoped)
- 📝 **Parameter Naming Templates** — Customize default names for request parameters (template: `{customapiname}-In-{uniquename}`)
- 📤 **Response Property Templates** — Customize default names for response properties (template: `{customapiname}-Out-{uniquename}`)
- 🎯 **Selection Filters** — Choose initial managed-state filters (All, Managed, Unmanaged) for Custom APIs and Business Events
- 🐛 **Debug Toggle** — Enable/disable Debug Mode from Settings
- 🌳 **View Preferences** — Toggle between standard and tree view layouts for Custom API details

### Debug Mode
- 🐛 **Zustand Store Inspector** — View real-time global application state with JSON formatting
- 🔍 **Tanstack React Query Devtools** — View application data with Tanstack React Query Devtools


## Quick Start

### For Power Platform Users

This tool is available in the Power Platform ToolBox marketplace. Install it directly from PPTB—no additional setup needed.

### For Developers

```bash
npm install
npm run build
```

The tool builds as a single-file bundle optimized for Power Platform ToolBox integration.

#### Development

```bash
npm run dev      # Local dev server with hot reload
npm run preview  # Test the production build locally
```

## Tech Stack

- **React 19** + TypeScript
- **Fluent UI v9** (Microsoft design system)
- **Zustand** (global state management)
- **Immer** (immutable state updates)
- **TanStack Query** (data fetching, mutations & async state management)
- **Vite** (IIFE bundler for iframe compatibility)

## Support & Feedback

- 📖 **Questions or feedback?** [Open an issue on GitHub](https://github.com/drivardxrm/pptb-customapi-events-manager/issues)
- 🐛 **Found a bug?** [Report it here](https://github.com/drivardxrm/pptb-customapi-events-manager/issues/new)

## License

MIT © David Rivard
