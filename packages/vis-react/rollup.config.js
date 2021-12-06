// Copyright (c) Volterra, Inc. All rights reserved.
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import pkg from './package.json'

// Array of extensions to be handled by babel
const extensions = ['.ts', '.tsx']

// Excluded dependencies
const external = [
  ...Object.keys(pkg.devDependencies),
  'lodash/isEqual',
]

export default {
  input: ['src/index.ts'],
  output: {
    dir: 'dist',
    sourcemap: true,
    format: 'esm',
    preserveModules: true,
  },
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions,
    }),
    babel({
      extensions,
      babelHelpers: 'inline',
      include: extensions.map(ext => `src/**/*${ext}`),
    }),
  ],
  external,
}
