/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require('./basic-leaflet-map.tsx').default
    return <Component />
  }}</BrowserOnly>,
  title: 'Basic Leaflet Map',
  description: <div>Mapping earthquakes from <a href="https://earthquake.usgs.gov" target="_blank">https://earthquake.usgs.gov</a></div>,
  preview: require('./preview.png').default,
  codeReact: require('!!raw-loader!./basic-leaflet-map.tsx').default,
  codeTs: require('!!raw-loader!./basic-leaflet-map.ts').default,
  codeAngular: {
    html: require('!!raw-loader!./basic-leaflet-map.html').default,
    component: require('!!raw-loader!./basic-leaflet-map.component.ts').default,
    module: require('!!raw-loader!./basic-leaflet-map.module.ts').default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
