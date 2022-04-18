/* eslint-disable import/no-unresolved, import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires */
import { ExampleCollection } from '@site/src/types/example'

export const examples: ExampleCollection[] = [
  {
    title: 'Lines and Areas',
    description: 'Examples of Line and Area charts',
    examples: [
      require('./basic-line-chart').default,
    ],
  },
  {
    title: 'Stacked and Grouped Bars',
    description: '',
    examples: [],
  },
  {
    title: 'Maps',
    description: '',
    examples: [],
  },
  /* ... */
]
