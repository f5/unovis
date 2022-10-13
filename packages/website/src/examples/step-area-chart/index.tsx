/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const pathname = 'step-area-chart'
const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require(`./${pathname}.tsx`).default
    return <Component />
  }}</BrowserOnly>,
  pathname,
  title: 'Step Area Chart',
  description: <div>
    <p>Mentions of 2016 US Presidential Candidates in Hip Hop Lyrics from 2007 - 2016</p>
    Data obtained from <a href="https://github.com/fivethirtyeight/data/tree/master/hip-hop-candidate-lyrics" target="_blank">FiveThirtyEight</a> (source : <a href="https://genius.com/" target="_blank">Genius</a>)
  </div>,
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
