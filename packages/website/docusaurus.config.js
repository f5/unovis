// Note: type annotations allow type checking and IDEs autocompletion

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lightCodeTheme = require('prism-react-renderer/themes/github')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Unovis',
  tagline: 'A modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript',
  url: 'https://unovis.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/unovis-pictogram-square.svg',
  organizationName: 'f5', // Usually your GitHub org/user name.
  projectName: 'unovis', // Usually your repo name.


  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/f5/unovis/tree/main/packages/website',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/f5/unovis/tree/main/packages/website',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/unovis-social.png',
      navbar: {
        title: '',
        logo: {
          alt: 'Unovis',
          src: 'img/unovis-logo.svg',
          srcDark: 'img/unovis-logo-dark-theme.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            href: '/gallery',
            position: 'left',
            label: 'Gallery',
          },
          {
            href: 'https://github.com/f5/unovis',
            label: 'Source Code',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Quick Start',
                to: '/docs/quick-start',
              },
              {
                label: 'Gallery',
                to: '/gallery',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/f5/unovis/discussions',
              },
              {
                label: 'StackOverflow',
                href: 'https://stackoverflow.com/questions/tagged/unovis',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/unovisdev',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Source Code',
                href: 'https://github.com/f5/unovis',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} F5, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'P3H3IE13LF',
        // Public API key: it is safe to commit it
        apiKey: 'c9cd28d2f8ba426e3675e241dcc20e12',
        indexName: 'unovis',
        contextualSearch: true,
        // Optional: Algolia search parameters
        searchParameters: {},
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
      },
    }),

  plugins: [
    [
      'docusaurus-plugin-react-docgen-typescript',
      {
        // pass in a single string or an array of strings
        src: ['src/**/*.tsx', '../react/src/**/*.tsx'],
        // global: true,
        parserOptions: {
          // pass parserOptions to react-docgen-typescript
          // here is a good starting point which filters out all
          // types from react
          propFilter: (prop, component) => {
            if (prop.parent) {
              return !prop.parent.fileName.includes('@types/react')
            }

            return true
          },
        },
      },
    ],
    () => ({
      configureWebpack () {
        return {
          module: {
            rules: [
              {
                test: /\.module.ts|component.ts|.svelte$/,
                loader: 'file-loader',
              },
            ],
          },
        }
      },
    }),
  ],
}

module.exports = config
