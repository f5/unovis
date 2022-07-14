/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import { ExampleCollection } from '@site/src/types/example'

export const examples: ExampleCollection[] = [
  {
    title: 'Lines and Areas',
    description: 'Examples of Line and Area charts',
    examples: [
      require('./basic-line-chart').default,
      require('./multi-line-chart').default,
      require('./basic-area').default,
      require('./basic-timeline').default,
    ],
  },
  {
    title: 'Bar Charts',
    description: '',
    examples: [
      require('./basic-grouped-bar').default,
      require('./horizontal-stacked-bar-chart').default,
      require('./brush-grouped-bar').default,
    ],
  },
  {
    title: 'Scatter Plots',
    description: '',
    examples: [
      require('./basic-scatter-chart').default,
      require('./free-brush-scatters').default,
    ],
  },
  {
    title: 'Maps',
    description: <div>
        Simple maps using <a href="https://github.com/topojson/topojson" target="_blank">TopoJSON</a> geometry and fully
        featured maps powered by <a href="https://github.com/Leaflet/Leaflet" target="_blank">Leaflet</a>{' '}
        (with <a href="https://maplibre.org/" target="_blank">MapLibre</a> or{' '}
      <a href="https://github.com/tangrams/tangram" target="_blank">Tangram</a> rendering)
    </div>,
    examples: [
      require('./basic-leaflet-map').default,
      require('./topojson-map').default,
    ],
  },
  /* {} */
]
