/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const groupedBarChart: Comparison<DataRecord[]> = {
  id: 'grouped-bar',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'horizontal', label: 'Horizontal', description: 'The bars run left to right, with the regions down the y axis (`orientation`)' },
    { id: 'trim-labels', label: 'Trimmed labels', description: 'Region names are trimmed to one line instead of wrapped (`tickTextFitMode`, `tickTextWidth`)' },
    { id: 'patterns', label: 'Patterns', description: 'Each year gets a fill pattern on top of its color, in the bars and the legend (`pattern`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        'trim-labels': {
          reason: 'Tick labels can be thinned out and rotated (`tickLabels.thin`, `rotate`), but not trimmed or wrapped.',
          url: 'https://tanstack.com/charts/latest/docs/reference/scales-guides-and-color#axis-options',
        },
        patterns: {
          reason: 'No pattern option: chart specs declare linear and radial gradients, but not pattern resources.',
          url: 'https://tanstack.com/charts/latest/docs/examples/themes-and-motion#current-limits',
        },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        'trim-labels': {
          reason: 'No option to trim axis labels: the `tick` object only passes SVG attributes on, so a one-line label with an ellipsis takes a custom tick component.',
          url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/cartesian/CartesianAxis.tsx',
        },
        patterns: {
          reason: 'No built-in patterns: a bar\'s `fill` can point at an SVG `<pattern>`, but you draw the pattern yourself.',
          url: 'https://github.com/recharts/recharts/blob/v3.10.1/storybook/stories/Examples/cartesian/Bar/FillPatternOrGradient.stories.tsx',
        },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        'trim-labels': {
          reason: 'No option to trim tick labels: Chart.js skips and rotates them (`autoSkip`, `maxRotation`), and shortening one takes your own `ticks.callback`.',
          url: 'https://www.chartjs.org/docs/4.5.1/axes/cartesian/#tick-configuration',
        },
        patterns: {
          reason: 'No built-in patterns: a fill can be a `CanvasPattern`, but you create each one yourself from an image or canvas, or add the community Patternomaly package.',
          url: 'https://github.com/chartjs/Chart.js/blob/v4.5.1/docs/general/colors.md#patterns-and-gradients',
        },
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
        patterns: {
          reason: 'No built-in patterns: a mark\'s `fill` can be a `url(#…)` that points at your own SVG `<defs>`, so you write each `<pattern>` yourself.',
          url: 'https://github.com/observablehq/plot/blob/v0.6.17/docs/features/marks.md#marks-are-layered',
        },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        patterns: {
          reason: 'No pattern option: a mark\'s `fill` is documented as a color or a gradient.',
          url: 'https://vega.github.io/vega-lite/docs/mark.html#color',
        },
      },
    },
  ],
}
