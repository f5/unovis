/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_GRAPH_CHART_HEIGHT } from '../constants'
import { GraphData, getData } from './data'

export const networkGraph: Comparison<GraphData> = {
  id: 'graph',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  updateLabel: 'Change the services',
  chartHeight: COMPARISON_GRAPH_CHART_HEIGHT,
  wide: true,
  presets: [
    { id: 'layered', label: 'Layered layout', description: 'Every service to the right of the services that call it (`layoutType: \'dagre\'`)' },
    { id: 'circular', label: 'Circular layout', description: 'The services on a ring (`layoutType: \'circular\'`)' },
    { id: 'size', label: 'Size by latency', description: 'Slower services get bigger nodes (`nodeSize`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        layered: { reason: '`forceLayout` is the only layout for a graph: the tidy `treeLayout` takes one parent per node, and a service with several callers doesn\'t fit in it.', url: 'https://tanstack.com/charts/latest/docs/examples/networks-and-hierarchies#show-a-strict-hierarchy' },
        circular: { reason: 'No circular layout: `forceLayout` has link, many-body, center, collide, x and y forces, and a ring needs D3\'s radial force passed in as a custom force.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/packages/charts-core/src/network-force.ts#L428-L503' },
      },
    },
    {
      library: 'echarts',
      load: () => import('./echarts'),
      code: require('!!raw-loader!./echarts.tsx').default,
      unsupportedPresets: {
        layered: { reason: 'The graph series only has the `none`, `force` and `circular` layouts, and the `tree` series takes nested children, so a service with several callers needs coordinates you compute yourself.', url: 'https://echarts.apache.org/en/option.html#series-graph.layout' },
      },
    },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        layered: { reason: 'The network always runs a force simulation (link, charge and center forces): there\'s no other layout.', url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/network/src/hooks.ts#L227-L230' },
        circular: { reason: 'The network always runs a force simulation (link, charge and center forces): there\'s no other layout.', url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/network/src/hooks.ts#L227-L230' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        layered: { reason: 'The plugin\'s `tree` and `dendrogram` charts take one `parent` per node, so a service with several callers needs coordinates you compute yourself for the plain `graph` chart.', url: 'https://github.com/sgratzl/chartjs-chart-graph/blob/v4.3.5/src/controllers/GraphController.ts#L645-L647' },
      },
    },
  ],
  unsupported: [
    { library: 'recharts', reason: 'Recharts has no network graph.', url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart' },
    { library: 'agcharts', reason: 'No network graph in either the Community or the Enterprise edition.', url: 'https://www.ag-grid.com/charts/javascript/module-registry/#selecting-modules' },
    { library: 'plot', reason: 'Observable Plot has no force layout: its only layout transform is the hierarchical tree, and the link mark needs precomputed coordinates.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/transforms' },
    { library: 'vegalite', reason: 'Vega-Lite has no force layout: Vega has a force transform, but Vega-Lite\'s transforms don\'t include it.', url: 'https://vega.github.io/vega-lite/docs/transform.html' },
  ],
}
