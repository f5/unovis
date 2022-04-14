/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import component from './code-react'

export default {
  component,
  title: 'Basic Line Chart',
  preview: require('./preview.png').default,
  codeReact: require('!!raw-loader!./code-react').default,
  codeTs: require('!!raw-loader!./code-ts').default,
  codeAngular: {
    html: require('!!raw-loader!./code-angular.html').default,
    component: require('!!raw-loader!./code-angular.component').default,
    module: require('!!raw-loader!./code-angular.module').default,
  },
}
