/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { Example } from '@site/src/types/example'

const example: Example = {
  component: () => <BrowserOnly>{() => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = require('./basic-grouped-bar.tsx').default
    return <Component />
  }}</BrowserOnly>,
  title: 'Basic Grouped Bar Chart',
  description: <div>U.S. Presidential election data obtained from <a href="https://dataverse.harvard.edu/" target="_blank">MIT Election Data and Science Lab</a></div>,
  preview: require('./preview.png').default,
  codeReact: require('!!raw-loader!./basic-grouped-bar.tsx').default,
  codeTs: require('!!raw-loader!./basic-grouped-bar.ts').default,
  codeAngular: {
    html: require('!!raw-loader!./basic-grouped-bar.html').default,
    component: require('!!raw-loader!./basic-grouped-bar.component.ts').default,
    module: require('!!raw-loader!./basic-grouped-bar.module.ts').default,
  },
  data: require('!!raw-loader!./data').default,
}

export default example
