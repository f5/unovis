// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sidebar: [
    'intro',
    'quick-start',
    {
      type: 'category',
      label: 'Component Reference',
      collapsed: false,
      link: { type: 'generated-index' },
      items: [
        { type: 'category', label: 'Containers', collapsed: false, items: [{ type: 'autogenerated', dirName: 'containers' }] },
        {
          'XY Components': [{ type: 'autogenerated', dirName: 'xy-charts' }],
          'Networks and Flows': [{ type: 'autogenerated', dirName: 'networks-and-flows' }],
          Maps: [{ type: 'autogenerated', dirName: 'maps' }],
          Misc: [{ type: 'autogenerated', dirName: 'misc' }],
          Auxiliary: [{ type: 'autogenerated', dirName: 'auxiliary' }],
        },
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [{ type: 'autogenerated', dirName: 'guides' }],
    },
  ],
}

module.exports = sidebars
