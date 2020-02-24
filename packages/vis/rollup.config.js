// Copyright (c) Volterra, Inc. All rights reserved.
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import transformPaths from '@zerollup/ts-transform-paths'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { string } from 'rollup-plugin-string'
import pkg from './package.json'
import modules from './rollup.modules.json'

const d3Libs = ['d3-array', 'd3-axis', 'd3-brush', 'd3-chord', 'd3-collection', 'd3-color',
  'd3-contour', 'd3-dispatch', 'd3-drag', 'd3-dsv', 'd3-ease', 'd3-fetch', 'd3-force',
  'd3-format', 'd3-geo', 'd3-hierarchy', 'd3-interpolate', 'd3-path',
  'd3-polygon', 'd3-quadtree', 'd3-random', 'd3-sankey', 'd3-scale', 'd3-scale-chromatic',
  'd3-selection', 'd3-shape', 'd3-time', 'd3-time-format', 'd3-timer', 'd3-transition',
  'd3-voronoi', 'd3-zoom']

const lodashLibs = ['lodash/isUndefined', 'lodash/isArray', 'lodash/isEmpty', 'lodash/isEqual',
  'lodash/isNil', 'lodash/cloneDeep', 'lodash/throttle', 'lodash/each', 'lodash/filter',
  'lodash/get', 'lodash/without', 'lodash/find', 'lodash/isString', 'lodash/isObject',
  'lodash/isFunction', 'lodash/isNumber', 'lodash/merge', 'lodash/isPlainObject', 'lodash/flatten',
  'lodash/omit', 'lodash/extend']

const globals = {}
d3Libs.reduce((acc, name) => { acc[name] = 'd3'; return acc }, globals)
lodashLibs.reduce((acc, name) => {
  acc[name] = `_.${name.replace('lodash/', '')}`
  return acc
}, globals)

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...d3Libs,
  ...lodashLibs,
]

const plugins = [
  string({
    include: '*.css',
  }),
  commonjs(),
  resolve(),
  json(),
  typescript({
    typescript: require('typescript'),
    transformers: [
      service => transformPaths(service.getProgram()),
    ],
  }),
]

export default [{
  input: 'src/index.ts',
  external: externals,
  output: [{
    file: pkg.main,
    sourcemap: true,
    globals,
    format: 'cjs',
  }, {
    file: pkg.module,
    sourcemap: true,
    format: 'esm',
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
