import type { LibraryId } from './types'

export type BuildSize = {
  library: LibraryId;
  /** What was bundled */
  entry: string;
  minKb: number;
  gzipKb: number;
}

// A three-series line chart with axes, a tooltip and a legend, bundled with esbuild (minified, ES2020, React external).
// Tree-shaken imports wherever the library supports them. Unovis is the build from this repository, the others are the
// published packages; the numbers come from `scripts/why-unovis-build-sizes` (see its RESULTS.md).
export const lineChartBuildSizes: BuildSize[] = [
  { library: 'unovis', entry: '@unovis/react, built from this repository', minKb: 164.0, gzipKb: 52.8 },
  { library: 'chartjs', entry: 'react-chartjs-2 + chart.js, registered components only', minKb: 161.8, gzipKb: 56.7 },
  { library: 'nivo', entry: '@nivo/line', minKb: 270.5, gzipKb: 93.6 },
  { library: 'recharts', entry: 'recharts', minKb: 372.0, gzipKb: 108.9 },
  { library: 'echarts', entry: 'echarts-for-react/lib/core + echarts/core, registered components only', minKb: 538.1, gzipKb: 182.8 },
  { library: 'agcharts', entry: 'ag-charts-react + ag-charts-community, registered modules only', minKb: 1320.8, gzipKb: 397.0 },
]
