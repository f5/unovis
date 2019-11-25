// Copyright (c) Volterra, Inc. All rights reserved.

import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
// import json from 'rollup-plugin-json'
// import ignore from 'rollup-plugin-ignore'
// import includePaths from 'rollup-plugin-includepaths'
// import globals from 'rollup-plugin-node-globals'
// import requireContext from 'rollup-plugin-require-context'
// import yaml from 'rollup-plugin-yaml'

const libraryName = '@volterra-vis/charts'
const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

export default [{
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: 'umd',
      globals: externals,
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      externals,
      sourcemap: true
    }
  ],
  external: externals,
  plugins: [
    commonjs(),
    resolve(),
    typescript({
      typescript: require('typescript')
    })
    // includePaths(),
    // ignore([/^\.\/locale$/, /moment$/]),
    // json(),
    // yaml({
    //   exclude: 'node_modules/**'
    // }),
    // requireContext(),

  ]
}]
