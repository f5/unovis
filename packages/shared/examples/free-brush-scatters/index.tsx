/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import type { Example } from '../types'
import './styles.css'

const pathname = 'free-brush-scatters'
const example: Example = {
  component: () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  },
  pathname,
  title: 'Scatter Plot with Free Brush',
  description: <div>
    Data from <a href="https://github.com/fivethirtyeight/data/tree/master/college-majors" target="_blank">
    FiveThirtyEight
    </a> (source: <em>American Community Survey 2010-2012</em>)
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
  data: require('!!raw-loader!./../sized-scatter-plot/data.ts').default,
  preview: require(`../_previews/${pathname}.png`).default,
  previewDark: require(`../_previews/${pathname}-dark.png`).default,
  styles: require('!!raw-loader!./styles.css').default,
}

export default example
