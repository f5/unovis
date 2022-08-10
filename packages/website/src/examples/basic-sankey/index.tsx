/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'basic-sankey'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'Basic Sankey',
  description: <p>UK households average expenditure on consumable items, 2019
    (source: <a href='https://www.ons.gov.uk/' target="_blank">Office for National Statistics</a>)
  </p>,
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
