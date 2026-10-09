// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sidebar: [
    'index',
    {
      type: 'category',
      label: 'Side by Side',
      collapsible: false,
      items: [
        'line-chart',
        'area-chart',
        'grouped-bar-chart',
        'stacked-bar-chart',
        'scatter-plot',
        'donut-chart',
        'circular-bar-chart',
        'network-graph',
        'sankey-diagram',
        'choropleth-map',
        'tile-map',
      ],
    },
    'feature-comparison',
    'methodology',
  ],
}

module.exports = sidebars
