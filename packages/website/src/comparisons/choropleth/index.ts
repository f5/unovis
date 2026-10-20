/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import type { Comparison } from '../types'
import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { ChoroplethData, getData } from './data'

export const choroplethMap: Comparison<ChoroplethData> = {
  id: 'choropleth',
  getData,
  dataCode: require('!!raw-loader!./data.ts').default,
  updateLabel: 'Pick another month',
  chartHeight: COMPARISON_TALL_CHART_HEIGHT,
  presets: [
    { id: 'mercator', label: 'Mercator', description: 'The map is drawn in the Mercator projection (`projection`)' },
    { id: 'labels', label: 'Country labels', description: 'Country names at the country centers, hiding the ones that would cover a larger country\'s name, a data center or the edge of the map (`areaLabel`)' },
    { id: 'traffic', label: 'Traffic bubbles', description: 'Each data center is sized by the traffic through it (`pointRadius`)' },
  ],
  implementations: [
    { library: 'unovis', load: () => import('./unovis'), code: require('!!raw-loader!./unovis.tsx').default },
    {
      library: 'tanstack',
      load: () => import('./tanstack'),
      code: require('!!raw-loader!./tanstack.tsx').default,
      unsupportedPresets: {
        labels: {
          reason: 'No labels on the map. The geo module has a single geoShape mark, and the text mark places labels with the x and y scales, not with a projection.',
          url: 'https://github.com/TanStack/charts/blob/v1.1.0/packages/charts-core/src/geo.ts',
        },
      },
    },
    { library: 'echarts', load: () => import('./echarts'), code: require('!!raw-loader!./echarts.tsx').default },
    {
      library: 'nivo',
      load: () => import('./nivo'),
      code: require('!!raw-loader!./nivo.tsx').default,
      unsupportedPresets: {
        labels: {
          reason: 'No labels on the map. The choropleth\'s layers are the graticule, the countries and the legends, and its `label` prop names the country in the tooltip.',
          url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/geo/src/Choropleth.js',
        },
        traffic: {
          reason: 'No data centers to size. The choropleth draws the countries only.',
          url: 'https://github.com/plouc/nivo/blob/v0.99.0/packages/geo/src/Choropleth.js',
        },
      },
    },
    {
      library: 'chartjs',
      load: () => import('./chartjs'),
      code: require('!!raw-loader!./chartjs.tsx').default,
      unsupportedPresets: {
        labels: {
          reason: 'No labels on the map. The geo plugin draws the countries as plain shapes, and Chart.js has no labels on data without another plugin.',
          url: 'https://github.com/sgratzl/chartjs-chart-geo/blob/v4.3.6/src/elements/GeoFeature.ts',
        },
      },
    },
    { library: 'plot', load: () => import('./plot'), code: require('!!raw-loader!./plot.tsx').default },
    { library: 'vegalite', load: () => import('./vegalite'), code: require('!!raw-loader!./vegalite.tsx').default },
  ],
  unsupported: [
    { library: 'recharts', reason: 'Recharts has no maps.', url: 'https://github.com/recharts/recharts/tree/v3.10.1/src/chart' },
    { library: 'agcharts', reason: 'Map shapes, markers and lines are part of AG Charts Enterprise.', url: 'https://www.ag-grid.com/charts/javascript/maps/', paid: true },
  ],
}
