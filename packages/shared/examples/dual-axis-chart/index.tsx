/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import type { Example } from '../types'

const pathname = 'dual-axis-chart'
const example: Example = {
  component: () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  },
  pathname,
  title: 'Dual Axis Chart',
  description: <div>
    Randomly Generated Data
    <div style={{ fontSize: '15px' }}>*This example shows how to create dual axis chart by overlapping two charts</div>
  </div>,
  codeReact: require(`!!raw-loader!./${pathname}.tsx`).default,
  codeTs: require(`!!raw-loader!./${pathname}.ts`).default,
  codeAngular: {
    html: require(`!!raw-loader!./${pathname}.component.html`).default,
    component: require(`!!raw-loader!./${pathname}.component.ts`).default,
    module: require(`!!raw-loader!./${pathname}.module.ts`).default,
  },
  codeSvelte: require(`!!raw-loader!./${pathname}.svelte`).default,
  codeVue: require(`!!raw-loader!./${pathname}.vue`).default,
  data: require('!!raw-loader!./data').default,
  preview: require(`../_previews/${pathname}.png`).default,
  previewDark: require(`../_previews/${pathname}-dark.png`).default,
}

export default example
