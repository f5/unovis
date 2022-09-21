/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'advanced-leaflet-map'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'Advanced Leaflet Map',
  description: <div>
    This example shows how to:
    <div style={{ paddingLeft: '10px' }}> • Define and use custom map styles;</div>
    <div style={{ paddingLeft: '10px' }}> • Set up a color map for points to display them as little pie charts;</div>
    <div style={{ paddingLeft: '10px' }}> • Use events to set up map interactions.</div>
    <br/>

    Read more in the <a href="/unovis/docs/maps/LeafletMap">Leaflet Map component documentation</a>.
  </div>,
  preview: require('./preview.png').default,
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  codeSvelte: require(`!!raw-loader!./${pathname}.svelte`).default,
  data: require('!!raw-loader!./data').default,
}

export default example
