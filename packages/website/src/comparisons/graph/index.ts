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
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
  ],
  unsupported: [
    { library: 'recharts', reason: 'Recharts has no network graph.', url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart' },
    { library: 'agcharts', reason: 'No network graph in either the Community or the Enterprise edition.', url: 'https://www.ag-grid.com/charts/javascript/module-registry/#selecting-modules' },
  ],
}
