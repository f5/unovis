/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const heatmap: Comparison<DataRecord[]> = {
  id: 'heatmap',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'rounded', label: 'Rounded gaps', description: 'Wider gaps between the cells and rounder corners (`cellPadding`, `cellCornerRadius`)' },
    { id: 'buckets', label: 'Eight buckets', description: 'Eight orange color steps instead of the four default greens (`colorRange`)' },
    { id: 'transposed', label: 'Hours as rows', description: 'The data fills the grid row by row, so the hours run down and the days across (`layout`, `numColumns`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'plot', load: () => import('./plot'), code: require('!!raw-loader!./plot.tsx').default },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    {
      library: 'recharts',
      reason: 'Recharts has no heatmap chart: each cell would be a custom `shape` on a Scatter over two category axes, sized by hand from the axis bands.',
      url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart',
    },
    { library: 'agcharts', reason: 'The Heatmap series is part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/heatmap-series/', paid: true },
  ],
}
