// Copyright (c) Volterra, Inc. All rights reserved.
import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from "rollup-plugin-terser"

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

const config = {
  input: 'src/index.ts',
  external: externals,
  output: {
    sourcemap: true
  },
  plugins: [
    commonjs(),
    resolve(),
    typescript(),
  ],
};

export default [
  {
    ...config,
    output: {
      ...config.output,
      file: 'lib/volterra-vis.js',
      name: pkg.name,
      format: 'umd',
      globals: externals,
    },
    plugins: [
      ...config.plugins,
    ]
  },
  {
    ...config,
    output: {
      ...config.output,
      file: 'lib/volterra-vis.min.js',
      name: pkg.name,
      format: 'umd',
      globals: externals,
    },
    plugins: [
      ...config.plugins,
      terser()
    ]
  },
  {
    ...config,
    output: {
      ...config.output,
      file: 'lib/volterra-vis.es.js',
      format: 'es',
      externals,
    },
    plugins: [
      ...config.plugins,
    ]
  },
]
