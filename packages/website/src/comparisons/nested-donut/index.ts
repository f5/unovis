/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { DataRecord, getData } from './data'

const rechartsRings = 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/SunburstChart.tsx#L302-L304'
const nivoLayout = 'https://github.com/plouc/nivo/blob/v0.99.0/packages/sunburst/src/hooks.ts#L60-L62'

export const nestedDonut: Comparison<DataRecord[]> = {
  id: 'nested-donut',
  getData,
  hint: 'Hover the segments, switch the site theme or resize the window',
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'inwards', label: 'Inwards', description: 'The platforms on the outer ring and the browsers inside, Unovis\' default direction (`direction`)' },
    { id: 'half', label: 'Half circle', description: 'The rings fill the top half of the circle (`angleRange`)' },
    { id: 'widths', label: 'Ring widths', description: 'Every ring gets its own width, the browser ring the widest (`layerSettings`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        widths: { reason: 'The sunburst mark divides the span from `innerRadius` to `outerRadius` into rings of equal width, with no option for the width of one depth.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/sunburst.md#responsive-partition' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        inwards: { reason: 'SunburstChart always draws the first level around `innerRadius` and every deeper level outside it, so the top level can\'t be the outer ring.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/chart/SunburstChart.tsx#L385-L399' },
        widths: { reason: 'SunburstChart gives every ring the same thickness, the span from `innerRadius` to `outerRadius` divided by the depth of the tree.', url: rechartsRings },
      },
    },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    {
      library: 'echarts',
      load: () => import('./echarts'),
      code: require('!!raw-loader!./echarts.tsx').default,
      unsupportedPresets: {
        half: { reason: 'The sunburst series has a `startAngle` but no end angle: its layout spreads the values over the full circle.', url: 'https://github.com/apache/echarts/blob/6.1.0/src/chart/sunburst/sunburstLayout.ts#L75' },
      },
    },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        inwards: { reason: 'The sunburst lays the tree out from the center outwards, with no option to reverse the rings.', url: nivoLayout },
        half: { reason: 'The sunburst has no start or end angle: its partition always spans the full circle.', url: nivoLayout },
        widths: { reason: 'The sunburst sizes the rings itself, so that every depth covers the same area, with no option for the width of a ring.', url: nivoLayout },
      },
    },
    {
      library: 'agcharts',
      load: () => import('./ag-charts'),
      code: require('!!raw-loader!./ag-charts.tsx').default,
      unsupportedPresets: {
        half: { reason: 'A donut series has a `rotation` for its start but no end angle or sweep: its sectors always fill the full circle.', url: 'https://github.com/ag-grid/ag-charts/blob/release-14.2.0/packages/ag-charts-types/src/series/polar/donutOptions.ts#L137-L138' },
      },
    },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    { library: 'plot', reason: 'Observable Plot has no arc mark, no partition layout and no polar coordinates, so the rings would have to be drawn as hand-written path geometry.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
  ],
}
