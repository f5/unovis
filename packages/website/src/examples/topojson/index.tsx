/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

import './styles.css'

const pathname = 'topojson'
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
  codeReact: require('!!raw-loader!./topojson.tsx').default,
  codeTs: require('!!raw-loader!./topojson.ts').default,
  codeAngular: {
    html: require('!!raw-loader!./topojson.html').default,
    component: require('!!raw-loader!./topojson.component.ts').default,
    module: require('!!raw-loader!./topojson.module.ts').default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
