// Copyright (c) Volterra, Inc. All rights reserved.
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

const extensions = ['.ts']
const plugins = [
  resolve({
    extensions,
  }),
  commonjs(),
  babel({
    extensions,
    babelHelpers: 'inline',
    include: extensions.map(ext => `autogen/*${ext}`),
  }),
]

export default [
  {
    input: './autogen/index.ts',
    output: [
      {
        file: '.autogen.js',
        format: 'cjs',
      },
    ],
    plugins,
  },
]
