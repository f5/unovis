/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require('./basic-line-chart.tsx').default
    return <Component />
  }}</BrowserOnly>,
  title: 'Basic Line Chart',
  description: '',
  preview: require('./preview.png').default,
  codeReact: require('!!raw-loader!./basic-line-chart.tsx').default,
  codeTs: require('!!raw-loader!./basic-line-chart.tsx').default,
  codeAngular: {
    html: require('!!raw-loader!./basic-line-chart.html').default,
    component: require('!!raw-loader!./basic-line-chart.component.ts').default,
    module: require('!!raw-loader!./basic-line-chart.module.ts').default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
