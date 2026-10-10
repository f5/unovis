/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { SankeyData, getData } from './data'

export const sankeyDiagram: Comparison<SankeyData> = {
  id: 'sankey',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
  ],
  unsupported: [
    { library: 'agcharts', reason: 'The Sankey series is part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/sankey-series/', paid: true },
    { library: 'plot', reason: 'No sankey mark. The link and arrow marks only connect points you position yourself, and the tree mark lays out hierarchies.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
    { library: 'vegalite', reason: 'No sankey layout. Vega-Lite\'s transforms stop at stack, window and pivot, so the node positions and link ribbons would have to be computed by hand.', url: 'https://vega.github.io/vega-lite/docs/transform.html' },
  ],
}
