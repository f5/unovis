/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { DataRecord, getData } from './data'

export const tileMap: Comparison<DataRecord[]> = {
  id: 'tile-map',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  updateLabel: 'Pick other earthquakes',
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default, renderer: 'WebGL tiles + SVG' },
  ],
  unsupported: [
    { library: 'recharts', reason: 'Recharts has no maps.', url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart' },
    { library: 'chartjs', reason: 'No tile maps. The community chartjs-chart-geo plugin draws projected GeoJSON shapes and bubbles, without map tiles.', url: 'https://github.com/sgratzl/chartjs-chart-geo' },
    { library: 'echarts', reason: 'No tile map of its own. The official bmap extension draws on Baidu Maps only, needs an API key and has no clustering.', url: 'https://github.com/apache/echarts/tree/6.1.0/extension-src/bmap' },
    { library: 'nivo', reason: 'No tile maps. @nivo/geo draws GeoJSON shapes only.', url: 'https://nivo.rocks/geomap/' },
    { library: 'agcharts', reason: 'No tile maps. Its GeoJSON maps are in the paid Enterprise edition.', url: 'https://www.ag-grid.com/charts/javascript/map-topology/' },
    { library: 'plot', reason: 'No tile maps. Its geo mark draws projected GeoJSON shapes; there is no tile layer among its marks.', url: 'https://github.com/observablehq/plot/tree/v0.6.17/src/marks' },
    { library: 'vegalite', reason: 'No tile maps. Its geoshape mark draws projected GeoJSON shapes; there is no tile mark, tile data source or clustering transform.', url: 'https://github.com/vega/vega-lite/blob/v6.5.0/src/mark.ts' },
  ],
}
