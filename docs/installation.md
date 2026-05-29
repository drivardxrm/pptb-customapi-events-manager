# Installation

## Use the tool in Power Platform ToolBox

If you are using the released tool inside Power Platform ToolBox, installation is handled through the PPTB marketplace. No extra repository setup is required.

## Run the project locally

### Prerequisites

- Node.js 18 or newer
- npm
- Power Platform ToolBox host context for full runtime integration

### App setup

```bash
npm install
npm run build
```

### Development

```bash
npm run dev
```

The app is built as a Vite-powered single-page application and bundled in **IIFE** format so it can run inside an iframe-backed PPTB host surface.

## Run the documentation site locally

```bash
npm run docs:dev
```

This starts the VitePress site so contributors can edit Markdown content and preview changes before publishing.

## Production-style previews

```bash
npm run preview
npm run docs:preview
```

## Publishing

The repository includes a GitHub Pages workflow that:

1. installs dependencies with `npm ci`
2. builds the site with `npm run docs:build`
3. deploys `docs/.vitepress/dist` to GitHub Pages

The production URL is:

```text
https://drivardxrm.github.io/pptb-customapi-events-manager/
```
