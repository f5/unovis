import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import type { OutputOptions } from 'rollup'

import pkg from './package.json'

const d3Libs = [
  'd3-array', 'd3-axis', 'd3-brush', 'd3-chord', 'd3-collection', 'd3-color',
  'd3-contour', 'd3-dispatch', 'd3-drag', 'd3-dsv', 'd3-ease', 'd3-fetch', 'd3-force',
  'd3-format', 'd3-geo', 'd3-hierarchy', 'd3-interpolate', 'd3-path',
  'd3-polygon', 'd3-quadtree', 'd3-random', 'd3-sankey', 'd3-scale', 'd3-scale-chromatic',
  'd3-selection', 'd3-shape', 'd3-time', 'd3-time-format', 'd3-timer', 'd3-transition',
  'd3-voronoi', 'd3-zoom',
]

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...d3Libs,
]

const externalRegexes = externals.map(name => new RegExp(`^${name}(/.*)?`))

const output: OutputOptions = {
  preserveModules: true,
  preserveModulesRoot: 'src',
  format: 'es',
  entryFileNames: '[name].js',
}

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.json', exclude: ['vite.config.ts'] }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    cssMinify: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        maps: resolve(__dirname, 'src/maps.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: externalRegexes,
      treeshake: false,
      output,
      onwarn (warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') throw new Error(warning.message)
        warn(warning)
      },
    },
  },
})
