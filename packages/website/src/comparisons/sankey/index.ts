/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { SankeyData, getData } from './data'

export const sankeyDiagram: Comparison<SankeyData> = {
  id: 'sankey',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'colors', label: 'Colored flows', description: 'Nodes take the palette colors and each flow takes the color of its source node (`nodeColor`, `linkColor`)' },
    { id: 'sorted', label: 'Sorted nodes', description: 'The nodes of every column are ordered by value, biggest first (`nodeSort`)' },
    { id: 'thin', label: 'Thin nodes', description: 'Narrow nodes with more room between them (`nodeWidth`, `nodePadding`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        colors: { reason: 'As an object, the `link` prop applies one set of SVG attributes to every link. Coloring each flow by its source node takes a custom `link` function that draws the path itself.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/Sankey.tsx#L901-L976' },
        sorted: { reason: 'No option to order the nodes by value. `sort` orders each column by where the layout places the nodes and `sort={false}` keeps the input order, so ordering them by value means summing their flows, sorting the nodes array and re-indexing the links yourself.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/Sankey.tsx#L880-L884' },
      },
    },
    {
      library: 'echarts',
      load: () => import('./echarts'),
      code: require('!!raw-loader!./echarts.tsx').default,
      unsupportedPresets: {
        sorted: { reason: 'No node sorting option. `layoutIterations: 0` keeps the input order, so ordering the nodes by value means summing and sorting them yourself.', url: 'https://echarts.apache.org/en/option.html#series-sankey.layoutIterations' },
      },
    },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        sorted: { reason: 'No node sorting option. The `priority` map takes a rank per node key, so ordering the nodes by value means summing their flows and ranking them yourself.', url: 'https://github.com/kurkle/chartjs-chart-sankey/blob/v0.19.1/src/types.ts' },
      },
    },
  ],
  unsupported: [
    { library: 'agcharts', reason: 'The Sankey series is part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/sankey-series/', paid: true },
    { library: 'plot', reason: 'No sankey mark. The link and arrow marks only connect points you position yourself, and the tree mark lays out hierarchies.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
    { library: 'vegalite', reason: 'No sankey layout. Vega-Lite\'s transforms stop at stack, window and pivot, so the node positions and link ribbons would have to be computed by hand.', url: 'https://vega.github.io/vega-lite/docs/transform.html' },
  ],
}
