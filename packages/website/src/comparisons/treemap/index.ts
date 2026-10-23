/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const treemap: Comparison<DataRecord[]> = {
  id: 'treemap',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'groups', label: 'Group labels', description: 'Every team gets a header with its name and total above its services (`labelInternalNodes`, `tilePaddingTop`)' },
    { id: 'rounded', label: 'Rounded tiles', description: 'Wider gaps between the tiles and rounded corners (`tilePadding`, `tileBorderRadius`)' },
    { id: 'shades', label: 'Shaded tiles', description: 'Within each team, the cheaper a service, the lighter its tile (`enableLightnessVariance`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        groups: { reason: 'The treemap mark renders only the leaves: there are no parent cells to label and no padding to make room for a header.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/treemap.md#nodes-labels-and-interaction' },
        shades: { reason: 'No option to shade tiles by value: `fill` is a per-node channel, so every shade would be a color you compute yourself.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/treemap.md#options' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        groups: { reason: 'No group header option: the default content writes every name in the middle of its node, so a header above the services takes a custom `content` renderer and a layout that leaves room for it.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/Treemap.tsx#L631-L694' },
        rounded: { reason: '`nodeGap` and `nodeInset` add the gaps, but the default content has no corner radius, so rounded tiles take a custom `content` renderer.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/Treemap.tsx#L631-L694' },
        shades: { reason: 'No option to shade tiles by value: the default content fills the top-level nodes from `colorPanel` and draws the leaves transparent over them.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/Treemap.tsx#L678-L682' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        shades: { reason: 'The treemap plugin has no option to shade tiles by value: `backgroundColor` is scriptable, so every shade would be a color you compute yourself.', url: 'https://github.com/kurkle/chartjs-chart-treemap/blob/v4.2.2/src/types.ts#L110' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        rounded: { reason: '`innerPadding` and `outerPadding` add the gaps, but the TreeMap has no corner radius option, so rounded tiles take a custom `nodeComponent`.', url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/treemap/src/types.ts#L114-L172' },
        shades: { reason: 'No option to shade tiles by value: `colors` assigns a color per `colorBy` group and `nodeOpacity` is one number for every node.', url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/treemap/src/types.ts#L149-L151' },
      },
    },
  ],
  unsupported: [
    { library: 'agcharts', reason: 'The Treemap series is part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/treemap-series/', paid: true },
    { library: 'plot', reason: 'No treemap mark (an open feature request). The tiles would be laid out with d3-hierarchy\'s treemap, which isn\'t part of Plot, and drawn as `rect` and `text` marks.', url: 'https://github.com/observablehq/plot/issues/1710' },
    { library: 'vegalite', reason: 'No treemap transform: Vega has one, Vega-Lite doesn\'t, so the tile positions would be computed with d3-hierarchy and drawn as ranged `rect` marks.', url: 'https://vega.github.io/vega-lite/docs/transform.html' },
  ],
}
