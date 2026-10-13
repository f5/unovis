/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const donutChart: Comparison<DataRecord[]> = {
  id: 'donut',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
  ],
  unsupported: [
    { library: 'plot', reason: 'Observable Plot has no arc or pie mark and no polar coordinates, so the slices would have to be drawn as hand-written path geometry.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
  ],
}
