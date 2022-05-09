/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const name = 'horizontal-stacked-bar-chart'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${name}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  title: 'Horizontal Stacked Bar Chart with Tooltip and Legend',
  description: <small>Data obtained from <a href="https://data.worldbank.org">World Bank Open Data</a></small>,
  preview: require('./preview.png').default,
  codeReact: require(`!!raw-loader!./${name}.tsx`).default,
  codeTs: require(`!!raw-loader!./${name}.ts`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${name}.html`).default,
    component: require(`!!raw-loader!./${name}.component.ts`).default,
    module: require(`!!raw-loader!./${name}.module.ts`).default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
