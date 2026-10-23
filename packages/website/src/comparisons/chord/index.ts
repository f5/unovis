/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { ChordData, getData } from './data'

export const chordDiagram: Comparison<ChordData> = {
  id: 'chord',
  getData,
  hint: 'Hover the arcs and ribbons, switch the site theme or resize the window',
  dataCode: require('!!raw-loader!./data.ts').default,
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'grouped', label: 'Grouped by continent', description: 'The regions are grouped into continents, drawn as an inner ring of arcs, and take the color of their continent (`nodeLevels`)' },
    { id: 'radial', label: 'Radial labels', description: 'The labels sit outside the arcs and point away from the center (`nodeLabelAlignment`)' },
    { id: 'gaps', label: 'Thick arcs', description: 'Wider arcs with bigger gaps between them (`nodeWidth`, `padAngle`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'echarts',
      load: () => import('./echarts'),
      code: require('!!raw-loader!./echarts.tsx').default,
      unsupportedPresets: {
        grouped: { reason: 'The chord series takes a flat list of nodes, so the regions can\'t be grouped into continents drawn as a second ring of arcs.', url: 'https://echarts.apache.org/en/option.html#series-chord.data' },
      },
    },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        grouped: { reason: '`Chord` takes a square matrix with one row per key, so the regions can\'t be grouped into continents drawn as a second ring of arcs.', url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/chord/src/types.ts#L28-L31' },
      },
    },
  ],
  unsupported: [
    { library: 'tanstack', reason: 'TanStack Charts has no chord layout or ribbon mark. Its polar marks can draw the arcs, but the ribbons would need a custom mark that draws each path, laid out with d3-chord.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/custom-extensions.md#custom-marks' },
    { library: 'recharts', reason: 'Recharts has no chord chart. Its charts are Area, Bar, Composed, Funnel, Line, Pie, Radar, RadialBar, Sankey, Scatter, Sunburst and Treemap.', url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart' },
    { library: 'chartjs', reason: 'Chart.js has no chord chart type, and there is no maintained plugin for one, so it would take a custom controller.', url: 'https://github.com/chartjs/awesome#charts' },
    { library: 'agcharts', reason: 'The Chord series is part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/chord-series/', paid: true },
    { library: 'plot', reason: 'Observable Plot has no chord layout and no arc or ribbon mark, so the arcs and ribbons would have to be computed with d3-chord and drawn in a custom `render` function.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
    { library: 'vegalite', reason: 'Vega-Lite has no chord layout and no ribbon mark, so the ribbons would have to be computed with d3-chord and drawn as `geoshape` polygons with an `identity` projection.', url: 'https://github.com/vega/vega-lite/blob/v6.5.0/src/mark.ts' },
  ],
}
