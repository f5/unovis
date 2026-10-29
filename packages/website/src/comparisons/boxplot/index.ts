/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const boxPlot: Comparison<DataRecord[]> = {
  id: 'boxplot',
  getData,
  hint: 'Hover the boxes, switch the site theme or resize the window',
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'colors', label: 'Colors', description: 'Every endpoint gets its own color from the palette (`color`)' },
    { id: 'min-max', label: 'Min–max whiskers', description: 'The whiskers reach the fastest and slowest request, so there are no outliers (`whiskers`)' },
    { id: 'rounded', label: 'Rounded boxes', description: 'Box corners rounded by 8 pixels (`roundedCorners`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        colors: { reason: '`boxY` takes one `fill` string for every box; it has no color channel.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/box.md#options' },
        'min-max': { reason: '`boxY` always draws Tukey whiskers (1.5 × IQR) with outlier dots; it has no option for min–max whiskers.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/box.md#summary-semantics' },
        rounded: { reason: '`boxY` has no corner radius option.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/box.md#options' },
      },
    },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        rounded: { reason: 'The box plot plugin has no corner radius option: it draws the box with `fillRect` and `strokeRect`.', url: 'https://github.com/sgratzl/chartjs-chart-boxplot/blob/v4.4.5/src/elements/BoxAndWiskers.ts' },
      },
    },
    {
      library: 'echarts',
      load: () => import('./echarts'),
      code: require('!!raw-loader!./echarts.tsx').default,
      unsupportedPresets: {
        rounded: { reason: 'The boxplot series draws its box as a path of straight lines, so `itemStyle.borderRadius` has no effect on it.', url: 'https://github.com/apache/echarts/blob/6.1.0/src/chart/boxplot/BoxplotView.ts' },
      },
    },
    { library: 'nivo', load: () => import('./nivo'), code: require('!!raw-loader!./nivo.tsx').default },
    {
      library: 'plot',
      load: () => import('./plot'),
      code: require('!!raw-loader!./plot.tsx').default,
      unsupportedPresets: {
        'min-max': { reason: '`boxY` always ends the whiskers at the last samples within 1.5 × IQR and draws the rest as outliers; it has no option to change that.', url: 'https://github.com/observablehq/plot/blob/v0.6.17/src/marks/box.js' },
      },
    },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    {
      library: 'agcharts',
      reason: 'The box plot series (`type: \'box-plot\'`) is part of AG Charts Enterprise.',
      url: 'https://www.ag-grid.com/charts/javascript/box-plot-series/',
      paid: true,
    },
  ],
}
