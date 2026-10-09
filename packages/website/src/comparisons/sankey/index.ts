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
  ],
}
