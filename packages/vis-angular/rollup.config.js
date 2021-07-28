// Copyright (c) Volterra, Inc. All rights reserved.
import typescript from 'rollup-plugin-typescript2'
import keysTransformer from 'ts-transformer-keys/transformer'
import ttypescript from 'ttypescript'

const plugins = [
  typescript({
    typescript: ttypescript,
    transformers: [service => ({
      before: [keysTransformer(service.getProgram())],
      after: [],
    })],
  }),
]

export default [
  {
    input: './generate-components.ts',
    output: [
      {
        dir: './',
        format: 'cjs',
      },
    ],
    plugins,
  },
]
