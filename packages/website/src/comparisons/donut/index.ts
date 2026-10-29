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
    { id: 'icons', label: 'Icons', description: 'An SVG icon in the middle of each segment, from symbols in the container\'s `svgDefs` (`icon`, `iconSize`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'TanStack Charts has no pattern option: a chart spec can declare linear and radial gradients but no patterns, so every SVG `<pattern>` would have to be drawn by hand.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/examples/themes-and-motion.md#current-limits' },
        icons: { reason: 'The polar marks are arcs, bars, lines, areas, dots, rules and text (`radialText`); there is no image or custom polar mark, so an icon would have to be positioned by hand outside the chart definition.', url: 'https://github.com/TanStack/charts/blob/v1.1.0/docs/reference/marks/polar.md#radialtext' },
      },
    },
    {
      library: 'recharts',
      load: () => import('./recharts'),
      code: require('!!raw-loader!./recharts.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Recharts has no built-in pattern fills: a slice\'s `fill` is an SVG paint string, so every `<pattern>` would have to be drawn by hand and referenced with `url(#id)`.', url: 'https://github.com/recharts/recharts/blob/v3.10.1/src/polar/Pie.tsx#L829-L833' },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Chart.js has no built-in patterns: `backgroundColor` can be a `CanvasPattern`, but you create each one yourself from an image or canvas, or add the third-party Patternomaly library its docs point to.', url: 'https://github.com/chartjs/Chart.js/blob/v4.5.1/docs/general/colors.md#patterns-and-gradients' },
        icons: { reason: 'Chart.js draws nothing on the arcs but their fill: labels on the data need the separate chartjs-plugin-datalabels from the community plugin list, or a custom plugin that draws on the canvas.', url: 'https://github.com/chartjs/awesome#plugins' },
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
        icons: { reason: 'The donut\'s `sectorLabel` is a text label (a formatter returning a string, with font and color options); there is no image or custom renderer for the sectors.', url: 'https://github.com/ag-grid/ag-charts/blob/release-14.2.0/packages/ag-charts-types/src/series/polar/donutOptions.ts#L45-L51' },
      },
    },
    {
      library: 'vegalite',
      load: () => import('./vegalite'),
      code: require('!!raw-loader!./vegalite.tsx').default,
      unsupportedPresets: {
        patterns: { reason: 'Vega-Lite has no pattern option: a mark\'s `fill` is typed as a color or a linear or radial gradient.', url: 'https://github.com/vega/vega-lite/blob/v6.5.0/src/mark.ts#L216' },
        icons: { reason: 'The `image` mark is positioned with `x` and `y`; it has no `theta` or `radius` channel, so putting one in each slice means computing every slice\'s centroid in the spec by hand.', url: 'https://github.com/vega/vega-lite/blob/v6.5.0/site/docs/mark/image.md' },
      },
    },
  ],
  unsupported: [
    { library: 'plot', reason: 'Observable Plot has no arc or pie mark and no polar coordinates, so the slices would have to be drawn as hand-written path geometry.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
  ],
}
