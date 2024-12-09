// Note: type annotations allow type checking and IDEs autocompletion

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lightCodeTheme = require('prism-react-renderer/themes/github')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Unovis',
  tagline: 'A modular data visualization framework for React, Angular, Svelte, Vue, Solid and vanilla TypeScript or JavaScript',
  url: 'https://unovis.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/unovis-pictogram-square.svg',
  organizationName: 'f5', // Usually your GitHub org/user name.
  projectName: 'unovis', // Usually your repo name.
  markdown: {
    mermaid: true,
  },
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
            to: 'releases',
            label: 'Releases',
            position: 'left',
          },
          {
            position: 'left',
            to: '/contributing/intro',
            label: 'Contributing',
          },
          {
            href: 'https://github.com/f5/unovis',
            position: 'right',
            className: 'brand__icon',
            html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
          },
          {
            href: 'https://discord.gg/5hnmashSaN',
            position: 'right',
            className: 'brand__icon',
            html: '<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg"><path d="M26.225 2.74a.075.075 90 00-.04-.035A24.255 24.255 90 0020.205.85a.09.09 90 00-.095.045 16.875 16.875 90 00-.745 1.53 22.39 22.39 90 00-6.72 0 15.475 15.475 90 00-.755-1.53.095.095 90 00-.095-.045A24.185 24.185 90 005.805 2.705a.085.085 90 00-.04.035C1.955 8.435.91 13.985 1.42 19.47a.1.1 90 00.04.07A24.385 24.385 90 008.8 23.245a.095.095 90 00.105-.035A17.41 17.41 90 0010.405 20.77a.095.095 90 00-.05-.13 16.06 16.06 90 01-2.295-1.095.095.095 90 01-.01-.155c.155-.115.31-.235.455-.355a.09.09 90 01.095-.015c4.81 2.195 10.02 2.195 14.775 0a.09.09 90 01.095.01c.145.12.3.245.455.36a.095.095 90 01-.01.155 15.07 15.07 90 01-2.295 1.09.095.095 90 00-.05.13 19.555 19.555 90 001.5 2.44.095.095 90 00.105.035A24.3 24.3 90 0030.535 19.535a.095.095 90 00.04-.07C31.185 13.13 29.545 7.625 26.225 2.74zM11.125 16.13c-1.45 0-2.64-1.33-2.64-2.96S9.655 10.205 11.125 10.205c1.485 0 2.665 1.34 2.64 2.96C13.765 14.8 12.595 16.13 11.125 16.13zm9.77 0c-1.45 0-2.64-1.33-2.64-2.96S19.42 10.205 20.895 10.205c1.485 0 2.665 1.34 2.64 2.96C23.535 14.8 22.375 16.13 20.895 16.13z"/></svg>',
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
                label: 'Discord',
                href: 'https://discord.gg/5hnmashSaN',
              },
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
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/@unovis/ts',
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
      announcementBar: {
        id: 'version-1.5-announcement',
        content:
          '❄️ Solid support; Graph, Axis, Legend updates; Sticky Tooltip; Discord; and more in <a rel="noopener noreferrer" href="/releases/1.5">Unovis 1.5</a>',
        backgroundColor: '#2680EB',
        textColor: '#fff',
        isCloseable: false,
      },
    }),

  plugins: [
    '@docusaurus/theme-mermaid',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'contributing',
        path: 'contributing',
        routeBasePath: 'contributing',
        include: ['**/*.md', '**/*.mdx', '../../**.md'],
      },
    ],
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
      name: 'unovis-custom-webpack-plugin',
      configureWebpack () {
        return {
          // cache: false, // Disable cache to prevent issues with building after updating Unovis packages
          module: {
            rules: [
              {
                test: /\.module.ts|component.ts|.svelte|-solid.tsx$/,
                loader: 'file-loader',
              },
            ],
          },
        }
      },
    }),
    [
      '@docusaurus/plugin-content-blog',
      {
        /**
         * Required for any multi-instance plugin
         */
        id: 'releases',
        /**
         * URL route for the blog section of your site.
         * *DO NOT* include a trailing slash.
         */
        routeBasePath: 'releases',
        /**
         * Path to data on filesystem relative to site dir.
         */
        path: './releases',
        onUntruncatedBlogPosts: 'ignore',
      },
    ],
  ],
}

module.exports = config
