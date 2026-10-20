/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const stackedBarChart: Comparison<DataRecord[]> = {
  id: 'stacked-bar',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'horizontal', label: 'Horizontal', description: 'The bars run left to right, with the months down the side (`orientation`)' },
    { id: 'patterns', label: 'Patterns', description: 'Every priority gets a fill pattern on top of its color (`pattern`)' },
    { id: 'capacity', label: 'Capacity line', description: 'A labeled line at the team\'s capacity of 400 tickets a month (`VisPlotline`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No fill patterns: chart specs declare linear and radial gradients, but not pattern resources.', url: 'https://tanstack.com/charts/latest/docs/examples/themes-and-motion#current-limits' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No fill patterns: a bar\'s `fill` can point to an SVG `<pattern>`, but you write the pattern\'s SVG yourself.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/cartesian/Bar.tsx' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No fill patterns: `backgroundColor` takes a CanvasPattern that you draw yourself or get from a third-party library such as Patternomaly.', url: 'https://www.chartjs.org/docs/4.5.1/general/colors.html#patterns-and-gradients' },
        capacity: { reason: 'No reference lines in Chart.js itself: a labeled line at a value takes the separate chartjs-plugin-annotation package.', url: 'https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/types/line.html' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    {
      library: 'plot',
      load: () => import('./plot'),
      code: require('!!raw-loader!./plot.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No fill patterns: a mark\'s `fill` takes a color, so an SVG `<pattern>` would have to be written by hand.', url: 'https://observablehq.com/plot/features/marks#mark-options' },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No fill patterns: a mark\'s `fill` takes a color or a gradient.', url: 'https://vega.github.io/vega-lite/docs/mark.html#color' },
      },
    },
  ],
}
