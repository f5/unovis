/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'basic-line-chart'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'Basic Line Chart',
  description: '',
  preview: require('./preview.png').default,
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
