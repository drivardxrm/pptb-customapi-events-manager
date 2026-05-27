# Custom API & Events Manager for Power Platform ToolBox

**All-in-one workspace for creating, managing, and testing Dataverse Custom APIs and Business Events—directly in Power Platform ToolBox.**

Designed for **Dataverse developers, solution architects, and integration builders** who need to configure and manage Custom APIs and Business Event subscriptions at scale—without leaving the Power Platform ecosystem.


## ✨ Features

**Create & Configure**
- 🔧 Custom APIs with guided UI for request/response schemas
- 📝 Step-by-step schema builders for complex payloads

**Test & Manage**
- 🧪 Validate APIs before deployment
- 📋 Business Event catalogs and subscriptions
- 📦 Organize APIs into solutions for governance




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
- **TanStack Query** (server state & solution-scoped caching)
- **Vite** (IIFE bundler for iframe compatibility)

## Support & Feedback

- 📖 **Questions or feedback?** [Open an issue on GitHub](https://github.com/drivardxrm/pptb-customapi-events-manager/issues)
- 🐛 **Found a bug?** [Report it here](https://github.com/drivardxrm/pptb-customapi-events-manager/issues/new)

## License

MIT © David Rivard
