/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { TimelineEvent, getData } from './data'

export const timeline: Comparison<TimelineEvent[]> = {
  id: 'timeline',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'rounded', label: 'Rounded', description: 'Every item gets rounded ends (`lineCap`)' },
    { id: 'arrows', label: 'Arrows', description: 'An arrow runs from every incident\'s cause, a deployment to another service, to the incident (`arrows`)' },
    { id: 'icons', label: 'Icons', description: 'A check mark ends every deployment and a warning sign starts every incident (`lineEndIcon`, `lineStartIcon`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        icons: { reason: 'No icon or custom symbol mark: `dot` draws circles and `hexagon` hexagons, so an icon would take a custom mark.', url: 'https://tanstack.com/charts/latest/docs/reference/marks/dot-and-hexagon' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        arrows: { reason: 'No arrows: a `ReferenceLine` with a `segment` connects two points, but the arrowhead would be an SVG marker you add in a custom `shape`.', url: 'https://recharts.github.io/en-US/api/ReferenceLine/' },
        icons: { reason: 'No icons on bars: you would draw each icon next to its rectangle in a custom bar `shape`, the way Recharts\' timeline example colors its bars.', url: 'https://recharts.github.io/en-US/examples/TimelineExample/' },
      },
    },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    { library: 'plot', load: () => import('./plot'), code: require('!!raw-loader!./plot.tsx').default },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        arrows: { reason: 'No arrow mark: a `rule` with `x2` and `y2` connects two points, but the arrowhead would be a `triangle` point mark you place and rotate yourself.', url: 'https://vega.github.io/vega-lite/docs/rule.html' },
      },
    },
  ],
  unsupported: [
    {
      library: 'nivo',
      reason: 'No timeline or range bars: the Gantt request (#1818) was closed without one, and bars start at zero, so items sharing a lane take transparent offset segments or a custom layer.',
      url: 'https://github.com/plouc/nivo/issues/1818',
    },
    { library: 'agcharts', reason: 'The Range Bar series that draws timelines is only in AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/range-bar-series/#horizontal-range-bar', paid: true },
  ],
}
