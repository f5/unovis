/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require('./stacked-bar-chart.tsx').default
    return <Component />
  }}</BrowserOnly>,
  title: 'Stacked Bar Chart with Tooltip and Legend',
  description: <small>Data obtained from <a href="https://data.worldbank.org">World Bank Open Data</a></small>,
  preview: require('./preview.png').default,
  codeReact: require('!!raw-loader!./stacked-bar-chart.tsx').default,
  codeTs: require('!!raw-loader!./stacked-bar-chart.ts').default,
  codeAngular: {
    html: require('!!raw-loader!./stacked-bar-chart.html').default,
    component: require('!!raw-loader!./stacked-bar-chart.component.ts').default,
    module: require('!!raw-loader!./stacked-bar-chart.module.ts').default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
