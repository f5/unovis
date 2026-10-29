/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { Data, getData } from './data'

export const annotations: Comparison<Data> = {
  id: 'annotations',
  getData,
  hint: 'Hover the charts, switch the site theme or resize the window',
  dataCode: require('!!raw-loader!./data.ts').default,
  presets: [
    { id: 'rings', label: 'Rings', description: 'A ring around every annotated day, with dashed connectors (`subject.radius`, `connectorLineStrokeDasharray`)' },
    { id: 'rich', label: 'Rich text', description: 'A bold headline over the detail in every callout (`content` as a list of styled text blocks)' },
    { id: 'window', label: 'Incident window', description: 'A band over the outage days and a goal line, next to the callouts (`VisPlotband`, `VisPlotline`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    { library: 'tanstack', load: () => import('./tanstack'), code: require('!!raw-loader!./tanstack.tsx').default },
    { library: 'recharts', load: () => import('./recharts'), code: require('!!raw-loader!./recharts.tsx').default },
    { library: 'chartjs', load: () => import('./chartjs'), code: require('!!raw-loader!./chartjs.tsx').default },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        rich: {
          reason: 'A marker\'s `legend` is one string in one `<text>` with one `textStyle`. A bold headline takes your own SVG in the untyped `legendNode` prop, or a custom layer.',
          url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/core/src/components/cartesian/markers/CartesianMarkersItem.js#L214-L234',
        },
        window: {
          reason: 'Its markers are reference lines only: the goal line works, but there\'s no band, so shading the outage takes a custom layer that draws the rectangle.',
          url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/core/src/components/cartesian/markers/CartesianMarkersItem.js',
        },
      },
    },
    { library: 'agcharts', load: () => import('./ag-charts'), code: require('!!raw-loader!./ag-charts.tsx').default },
    { library: 'plot', load: () => import('./plot'), code: require('!!raw-loader!./plot.tsx').default },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
}
