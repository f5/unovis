/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const areaChart: Comparison<DataRecord[]> = {
  id: 'area',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'step', label: 'Step areas', description: 'Steps between the months instead of curves (`curveType`)' },
    { id: 'patterns', label: 'Patterns', description: 'Every service gets a fill pattern on top of its color (`pattern`)' },
    { id: 'annotations', label: 'Annotations', description: 'A band over the migration months and a budget line (`VisPlotband`, `VisPlotline`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No pattern option: chart specs declare linear and radial gradients, but not pattern resources.', url: 'https://tanstack.com/charts/latest/docs/examples/themes-and-motion#current-limits' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No built-in fill patterns: an Area\'s `fill` takes a color, or a `url(#id)` pointing at an SVG `<pattern>` you draw yourself in `<defs>`.', url: 'https://recharts.github.io/en-US/examples/AreaChartFillByValue/' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No built-in fill patterns: `backgroundColor` can be a `CanvasPattern`, but you create each one yourself from an image or canvas, or add the third-party Patternomaly library its docs point to.', url: 'https://www.chartjs.org/docs/latest/general/colors.html#patterns-and-gradients' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        annotations: { reason: 'The `markers` prop draws the budget line, but there\'s no band: shading the migration months takes a custom layer that draws the rectangle.', url: 'https://nivo.rocks/storybook/?path=/story/line--custom-layers' },
      },
    },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    {
      library: 'plot',
      load: () => import('./plot'),
      code: require('!!raw-loader!./plot.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No built-in fill patterns: an area\'s `fill` can be a `url(#id)`, but you write the SVG `<pattern>` yourself, e.g. in a function mark that returns `<defs>`.', url: 'https://observablehq.com/plot/features/marks#marks-are-layered' },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'No pattern option: a mark\'s `fill` is documented as a color or a gradient, and the `color` encoding maps the services to colors only.', url: 'https://vega.github.io/vega-lite/docs/mark.html#color' },
      },
    },
  ],
}
