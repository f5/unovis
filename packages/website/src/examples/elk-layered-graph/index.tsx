/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'elk-layered-graph'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'ELK Layered Graph Layout',
  description: <p>
    This example shows how to use <a href="https://www.eclipse.org/elk/" target="_blank">The Eclipse Layout Kernel (ELK)</a> with Graph.
    ELK is a powerful layout engine with many different types of graph layouts available.
    Check out the <a href="https://rtsys.informatik.uni-kiel.de/elklive/" target="_blank">ELK Demonstrators</a> page to learn more.
  </p>,
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.ts`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  codeSvelte: require(`!!raw-loader!./${pathname}.svelte`).default,
  data: require('!!raw-loader!./data').default,
  preview: require(`../_previews/${pathname}.png`).default,
  previewDark: require(`../_previews/${pathname}-dark.png`).default,
}

export default example
