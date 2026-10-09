import websitePackage from '../../package.json'
import type { LibraryId } from './types'

export type Library = {
  id: LibraryId;
  name: string;
  version: string;
  packages: string[];
  license: string;
  renderer: string;
  website: string;
}

const dependencies: Record<string, string> = websitePackage.dependencies

export const libraries: Record<LibraryId, Library> = {
  unovis: {
    id: 'unovis',
    name: 'Unovis',
    version: websitePackage.version,
    packages: ['@unovis/react'],
    license: 'Apache-2.0',
    renderer: 'SVG',
    website: 'https://unovis.dev',
  },
  recharts: {
    id: 'recharts',
    name: 'Recharts',
    version: dependencies.recharts,
    packages: ['recharts'],
    license: 'MIT',
    renderer: 'SVG',
    website: 'https://recharts.github.io',
  },
  chartjs: {
    id: 'chartjs',
    name: 'Chart.js',
    version: dependencies['chart.js'],
    packages: ['chart.js', 'react-chartjs-2', 'chartjs-chart-graph', 'chartjs-chart-sankey', 'chartjs-chart-geo'],
    license: 'MIT',
    renderer: 'Canvas',
    website: 'https://www.chartjs.org',
  },
  echarts: {
    id: 'echarts',
    name: 'ECharts',
    version: dependencies.echarts,
    packages: ['echarts', 'echarts-for-react'],
    license: 'Apache-2.0',
    renderer: 'Canvas',
    website: 'https://echarts.apache.org',
  },
  nivo: {
    id: 'nivo',
    name: 'Nivo',
    version: dependencies['@nivo/core'],
    packages: ['@nivo/line', '@nivo/bar', '@nivo/scatterplot', '@nivo/pie', '@nivo/network', '@nivo/sankey', '@nivo/geo'],
    license: 'MIT',
    renderer: 'SVG',
    website: 'https://nivo.rocks',
  },
  agcharts: {
    id: 'agcharts',
    name: 'AG Charts',
    version: dependencies['ag-charts-community'],
    packages: ['ag-charts-community', 'ag-charts-react'],
    license: 'MIT (Community)',
    renderer: 'Canvas',
    website: 'https://www.ag-grid.com/charts/',
  },
}
