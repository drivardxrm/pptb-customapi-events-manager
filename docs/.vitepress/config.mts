import { defineConfig } from 'vitepress';

const repository = 'drivardxrm/pptb-customapi-events-manager';
const repositoryName = (process.env.GITHUB_REPOSITORY ?? repository).split('/')[1];
const base = process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}/` : '/';

export default defineConfig({
  title: 'Custom API & Events Manager',
  description: 'Documentation and showcase for the Power Platform ToolBox app for Dataverse Custom APIs and Business Events.',
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: `${base}logo.svg` }],
    ['meta', { name: 'theme-color', content: '#4f46e5' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Custom API & Events Manager',
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Introduction', link: '/introduction' },
      { text: 'Installation', link: '/installation' },
      { text: 'Usage', link: '/usage' },
      { text: 'Reference', link: '/api-reference' },
      { text: 'Examples', link: '/examples' },
      { text: 'GitHub', link: `https://github.com/${repository}` },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
          { text: 'Usage', link: '/usage' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'Settings', link: '/settings' },
          { text: 'Debug Mode', link: '/debug-mode' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/api-reference' },
          { text: 'Examples', link: '/examples' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: `https://github.com/${repository}` }],
    editLink: {
      pattern: `https://github.com/${repository}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Built with VitePress and published with GitHub Pages.',
      copyright: 'MIT Licensed',
    },
    outline: {
      level: [2, 3],
    },
  },
});
