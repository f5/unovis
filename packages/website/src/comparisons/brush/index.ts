/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { Comparison } from '../types'
import { DataRecord, getData } from './data'

export const brush: Comparison<DataRecord[]> = {
  id: 'brush',
  getData,
  hint: 'Drag the brushes, hover the charts, switch the site theme or resize the window',
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'window', label: '30-day window', description: 'The brush starts on the last 30 days, and you drag the window along the year (`selection`, `draggable`)' },
    { id: 'handles', label: 'Outside handles', description: '14-pixel brush handles that sit outside the selected range (`handlePosition`, `handleWidth`)' },
    { id: 'zoom-box', label: 'Zoom box', description: 'Drag a rectangle on the chart to zoom into the days and values inside it (`VisFreeBrush` with `mode: xy`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        'zoom-box': { reason: 'No two-dimensional brush: `brushX` selects x ranges only, and `zoomX` zooms the x axis with the wheel.', url: 'https://tanstack.com/charts/latest/docs/guides/interactions-and-selections#brush-selection' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        'zoom-box': { reason: 'No drag-to-zoom: Recharts\' highlight-and-zoom example builds it from mouse events, a `ReferenceArea` and your own axis domains.', url: 'https://recharts.github.io/en-US/examples/HighlightAndZoomLineChart/' },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        handles: { reason: 'An interval selection has no handles: you drag out a new range, drag the selection to move it, or scroll over it to resize it.', url: 'https://vega.github.io/vega-lite/docs/selection.html#interval' },
        'zoom-box': { reason: 'No drag-to-zoom box: a brushed rectangle sets the scale domains of another view, and `bind: \'scales\'` zooms a view with the wheel and pans it by dragging.', url: 'https://vega.github.io/vega-lite/docs/bind.html#scale-binding' },
      },
    },
  ],
  unsupported: [
    { library: 'chartjs', reason: 'No brush or range selector: selecting a range takes a community plugin such as chartjs-plugin-selectdrag. The official chartjs-plugin-zoom does draw the Zoom box preset (`zoom: { drag: { enabled: true }, mode: \'xy\' }`).', url: 'https://github.com/01CodeLT/chartjs-plugin-selectdrag' },
    { library: 'nivo', reason: 'No brush: a prototype (pull request #563) was never merged, so a range selection takes a custom layer with d3-brush.', url: 'https://github.com/plouc/nivo/pull/563' },
    { library: 'agcharts', reason: 'The Navigator, a range selector with a mini chart, is an Enterprise feature.', url: 'https://www.ag-grid.com/charts/javascript/navigator/', paid: true },
    { library: 'plot', reason: 'No brush (issue #5 is open): you attach d3-brush to the returned SVG and convert pixels with `plot.scale(\'x\').invert`.', url: 'https://observablehq.com/plot/features/interactions#selecting' },
  ],
}
