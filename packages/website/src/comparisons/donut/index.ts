/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const donutChart: Comparison<DataRecord[]> = {
  id: 'donut',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'rounded', label: 'Rounded gaps', description: 'Gaps between the segments and rounded corners (`padAngle`, `cornerRadius`)' },
    { id: 'half', label: 'Half donut', description: 'The segments fill the top half of the circle, with the label under them (`angleRange`)' },
    { id: 'patterns', label: 'Patterns', description: 'Every segment gets a fill pattern on top of its color (`pattern`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'TanStack Charts has no pattern fills: `radialArc` takes a CSS color as `fill`, so every SVG `<pattern>` would have to be drawn by hand.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/packages/charts-core/src/polar.ts#L394' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Recharts has no pattern fills: a slice\'s `fill` takes a color, so every SVG `<pattern>` would have to be drawn by hand.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/polar/Pie.tsx' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Chart.js has no built-in patterns: `backgroundColor` takes a `CanvasPattern` you draw yourself, and its docs point to the third-party Patternomaly library.', url: 'https://github.com/chartjs/Chart.js/blob/v4.5.1/docs/general/colors.md#patterns-and-gradients' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    {
      library: 'agcharts',
      load: () => import('./ag-charts'),
      code: require('!!raw-loader!./ag-charts.tsx').default,
      unsupportedPresets: {
        half: { reason: 'The AG Charts donut series has a `rotation` but no start or end angle, so the sectors always close the full circle.', url: 'https://github.com/ag-grid/ag-charts/blob/release-14.2.0/packages/ag-charts-types/src/series/polar/donutOptions.ts#L137-L138' },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Vega-Lite has no pattern fills: a mark\'s `fill` takes a color or a linear or radial gradient.', url: 'https://github.com/vega/vega-lite/blob/v6.5.0/src/mark.ts#L216' },
      },
    },
  ],
  unsupported: [
    { library: 'plot', reason: 'Observable Plot has no arc or pie mark and no polar coordinates, so the slices would have to be drawn as hand-written path geometry.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
  ],
}
