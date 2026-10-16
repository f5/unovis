/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const lineChart: Comparison<DataRecord[]> = {
  id: 'line',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'step', label: 'Step line', description: 'Steps between the months instead of curves (`curveType`)' },
    { id: 'dashed', label: 'Dashed iOS', description: 'The iOS series is drawn dashed (`lineDashArray`)' },
    { id: 'annotations', label: 'Annotations', description: 'A band over the iOS outage and a target line (Plotband, Plotline)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    { library: 'plot', load: () => import('./plot'), code: require('!!raw-loader!./plot.tsx').default },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
}
