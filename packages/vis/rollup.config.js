// Copyright (c) Volterra, Inc. All rights reserved.
import typescript from 'rollup-plugin-typescript2'
import transformPaths from '@zerollup/ts-transform-paths'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import modules from './rollup.modules.json'

import { tsFix } from './ts-fix'

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const plugins = [
  commonjs(),
  resolve(),
  typescript({
    typescript: require('typescript'),
    transformers: [service => transformPaths(service.getProgram())],
  }),
  {
    name: 'ts3.7-fix',
    writeBundle: () => {
      tsFix()
    },
  },
]

export default [{
  input: 'src/index.ts',
  external: externals,
  output: [{
    file: pkg.main,
    sourcemap: true,
    globals: externals,
    format: 'cjs',
  }, {
    file: pkg.module,
    sourcemap: true,
    format: 'esm',
  }, {
    file: pkg.browser,
    format: 'iife',
    globals: externals,
    name: 'vv',
    plugins: [terser()],
  }],
  plugins,
},
...modules.map(d => ({
  input: d.input,
  external: externals,
  output: {
    file: d.output,
    sourcemap: true,
    format: 'esm',
  },
  plugins,
})),
]
