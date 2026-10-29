/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { DataRecord, getData } from './data'

export const circularBarChart: Comparison<DataRecord[]> = {
  id: 'circular-bar',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'half', label: 'Half circle', description: 'The bars are laid out over the top half of the circle (`angleRange`)' },
    { id: 'square', label: 'Square bars', description: 'Square corners instead of rounded petals (`cornerRadius`, `innerCornerRadius`)' },
    { id: 'gaps', label: 'Wide gaps', description: 'Wider gaps between the bars, 24 px of constant width along their sides (`barPadding`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        gaps: {
          reason: 'The polar bar chart has no option for a gap between the bars: its angle scale is a band scale without padding.',
          url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/polar-bar/src/hooks.ts',
        },
      },
    },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    {
      library: 'agcharts',
      reason: 'The Radial Column series that draws this chart is only in AG Charts Enterprise.',
      url: 'https://www.ag-grid.com/charts/javascript/radial-column-series/',
      paid: true,
    },
    {
      library: 'plot',
      reason: 'Plot has no arc mark and no polar coordinates, so the bars would have to be drawn as hand-written path geometry.',
      url: 'https://observablehq.com/plot/features/marks',
    },
  ],
}
