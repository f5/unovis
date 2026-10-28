import type { LibraryId } from './types'

export type BuildSize = {
  library: LibraryId;
  /** What was bundled */
  entry: string;
  minKb: number;
  gzipKb: number;
}

// Three smooth (monotone) lines with axes, a legend, a tooltip for all series, a crosshair and animation, configured
// with each library's own options and bundled with esbuild (minified, ES2020, React external). Tree-shaken imports
// wherever the library supports them. A library that can't animate or draw a crosshair is measured without it and says so
// in `entry`. Unovis is the build from this repository, the others are the published packages; the numbers come from
// `scripts/why-unovis-build-sizes` (see its RESULTS.md).
export const lineChartBuildSizes: BuildSize[] = [
  { library: 'unovis', entry: '@unovis/react, built from this repository', minKb: 162.9, gzipKb: 52.4 },
  { library: 'tanstack', entry: '@tanstack/charts/react/core with the motion() renderer, d3Curve(curveMonotoneX) and focusGuideX', minKb: 161.3, gzipKb: 54.7 },
  { library: 'chartjs', entry: 'react-chartjs-2 + chart.js, registered components only, and a few-line crosshair plugin', minKb: 162.1, gzipKb: 56.8 },
  { library: 'plot', entry: '@observablehq/plot in a useEffect, with a pointer rule as the crosshair; Plot doesn\'t animate', minKb: 262.4, gzipKb: 88.8 },
  { library: 'nivo', entry: '@nivo/line, with slices as the crosshair', minKb: 270.5, gzipKb: 93.6 },
  { library: 'recharts', entry: 'recharts', minKb: 372.0, gzipKb: 108.9 },
  { library: 'echarts', entry: 'echarts-for-react/lib/core + echarts/core, registered components only', minKb: 538.1, gzipKb: 182.8 },
  { library: 'vegalite', entry: 'react-vega + vega-embed, vega-lite and vega, with a rule as the crosshair; Vega-Lite doesn\'t animate', minKb: 825.4, gzipKb: 284.5 },
  { library: 'agcharts', entry: 'ag-charts-react + ag-charts-community, registered modules only; the crosshair and animation are Enterprise', minKb: 1320.8, gzipKb: 397.0 },
]
