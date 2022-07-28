import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import transformPaths from '@zerollup/ts-transform-paths'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
// import visualizer from 'rollup-plugin-visualizer'
import pkg from './package.json'

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
  'lodash/omit', 'lodash/extend', 'lodash/groupBy', 'lodash/uniq', 'lodash/sortBy', 'lodash/range',
  'lodash/findIndex']

// Removing maplibre-gl from the externals because Angular 14 doesn't know how to import *.css files directly
// and we want `postcss` to convert them to `css.js`
delete pkg.dependencies['maplibre-gl']

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...d3Libs,
  ...lodashLibs,
]

const regexesOfPackages = externals // To prevent having node_modules in the build files
  .map(packageName => new RegExp(`^${packageName}(/.*)?`))

const plugins = [
  postcss({
    plugins: [],
    inject: false,
    minimize: true,
  }),
  commonjs(),
  resolve({
    extensions: ['.ts'],
    mainFields: ['jsnext:main', 'module', 'main', 'browser'],
  }),
  json(),
  typescript({
    typescript: require('typescript'),
    transformers: [(service) => transformPaths(service.getProgram())],
  }),
  // visualizer({ sourcemap: true, template: 'network' }),
]

export default [
  {
    input: 'src/index.ts',
    external: regexesOfPackages,
    output: {
      dir: 'lib',
      sourcemap: true,
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: './src',
    },
    plugins,
  },
  {
    input: 'src/maps.ts',
    output: {
      dir: 'lib',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: './src',
    },
    plugins,
  },
]
