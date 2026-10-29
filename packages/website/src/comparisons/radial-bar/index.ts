/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { DataRecord, getData } from './data'

export const radialBarChart: Comparison<DataRecord[]> = {
  id: 'radial-bar',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'rounded', label: 'Rounded ends', description: 'Rounded ends on every bar (`cornerRadius`)' },
    { id: 'gauge', label: 'Gauge', description: 'The rings cover 270 degrees, open at the bottom (`angleRange`)' },
    { id: 'thick', label: 'Thick rings', description: 'Rings of 28 px with 4 px gaps instead of 16 px (`trackWidth`, `trackPadding`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    {
      library: 'agcharts',
      load: () => import('./ag-charts'),
      code: require('!!raw-loader!./ag-charts.tsx').default,
      unsupportedPresets: {
        gauge: {
          reason: 'The Donut series has a `rotation` but no option for the angle it covers, so every ring closes the full circle; a transparent filler sector would get a legend item and a tooltip.',
          url: 'https://www.ag-grid.com/charts/javascript/donut-series/',
        },
      },
    },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    {
      library: 'plot',
      reason: 'Plot has no arc mark and no polar scales; the rings could only be emulated as thick `line` marks along parallels of an `azimuthal-equidistant` projection.',
      url: 'https://github.com/observablehq/plot/issues/133#issuecomment-1607373580',
    },
  ],
}
