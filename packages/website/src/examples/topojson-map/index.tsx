/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'topojson-map'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'Choropleth World Map with Custom Legend',
  description: <small>Life expectancy data obtained from <a href="https://ourworldindata.org/life-expectancy">Our World in Data</a></small>,
  preview: require('./preview.png').default,
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.ts`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  codeSvelte: require(`!!raw-loader!./${pathname}.svelte`).default,
  data: require('!!raw-loader!./data').default,
}

export default example
