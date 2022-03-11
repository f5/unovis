// Copyright (c) Volterra, Inc. All rights reserved.

// Note: type annotations allow type checking and IDEs autocompletion

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lightCodeTheme = require('prism-react-renderer/themes/github')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'UNOVIS',
  tagline: 'A modular data visualization framework for React, Angular and vanilla TypeScript',
  url: 'https://f5.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/unovis-pictogram.svg',
  organizationName: 'F5', // Usually your GitHub org/user name.
  projectName: 'unovis', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      navbar: {
        title: '',
        logo: {
          alt: 'UNOVIS',
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
            href: 'https://f5-innersourcing.pages.gitswarm.f5net.com/unovis/showcase',
            position: 'left',
            label: 'Showcase',
          },
          {
            href: 'https://github.com/f5networks/unovis',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/unovis',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/unovis',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/f5networks/unovis',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} F5, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    [
      'docusaurus-plugin-react-docgen-typescript',
      {
        // pass in a single string or an array of strings
        src: ['src/**/*.tsx', '../vis-react/src/**/*.tsx'],
        tsConfig: 'tsconfig.json',
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
  ],
}

module.exports = config
