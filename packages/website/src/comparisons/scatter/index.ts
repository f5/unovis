/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const scatterPlot: Comparison<DataRecord[]> = {
  id: 'scatter',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  updateLabel: 'Pick other penguins',
  presets: [
    { id: 'labels', label: 'Labels', description: 'Every penguin gets a body mass label, and the labels that would cover a point or another label hide (`label`, `labelHideOverlapping`)' },
    { id: 'rings', label: 'Rings', description: 'Points drawn as rings in the species color, so overlapping penguins stay visible (`strokeColor`, `strokeWidth`)' },
    { id: 'averages', label: 'Average lines', description: 'Dashed lines at the average flipper and bill length split the penguins into quadrants (Plotline)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        labels: { reason: 'A `text` mark draws every label, overlapping ones included: the docs leave data-label collisions to explicit placement.', url: 'https://tanstack.com/charts/latest/docs/reference/marks/text-frame-and-facet#text' },
        rings: { reason: 'The `dot` mark takes one `stroke` color and its color channel sets only the fill, so rings in each species\' color need a mark per species with colors picked by hand.', url: 'https://tanstack.com/charts/latest/docs/reference/marks/dot-and-hexagon#dot' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        labels: { reason: '`LabelList` draws a label on every point, and nothing hides the ones that cover a point or another label.', url: 'https://recharts.github.io/en-US/api/LabelList/' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        labels: { reason: 'Chart.js draws no data labels: they come from the chartjs-plugin-datalabels plugin, which hides overlapping ones with `display: \'auto\'`.', url: 'https://chartjs-plugin-datalabels.netlify.app/guide/positioning.html#overlap' },
        averages: { reason: 'Chart.js draws no reference lines: they come from the chartjs-plugin-annotation plugin.', url: 'https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/types/line.html' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        labels: { reason: 'The scatter plot has no point labels: `annotations` add a note to the points they match, with no overlap detection.', url: 'https://nivo.rocks/scatterplot/' },
        rings: { reason: 'A node is a filled circle with no stroke options; a ring takes a custom `nodeComponent`.', url: 'https://nivo.rocks/storybook/?path=/story/scatterplot--custom-node' },
      },
    },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    {
      library: 'plot',
      load: () => import('./plot'),
      code: require('!!raw-loader!./plot.tsx').default,
      unsupportedPresets: {
        labels: { reason: 'A `text` mark draws every label, overlapping ones included: Plot has no overlap detection, so the docs pick the points to label with `filter`.', url: 'https://observablehq.com/plot/marks/text' },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        labels: { reason: 'A `text` layer draws every label, overlapping ones included: Vega\'s `label` transform, which avoids overlaps, isn\'t one of Vega-Lite\'s transforms.', url: 'https://vega.github.io/vega-lite/docs/transform.html' },
      },
    },
  ],
}
