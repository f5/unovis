import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'
import type { OutputOptions } from 'rollup'

import pkg from './package.json'

const externals = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
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
    react({ jsxRuntime: 'classic' }),
    dts({ tsconfigPath: './tsconfig.lib.json', exclude: ['vite.config.ts'] }),
  ],
  resolve: {
    alias: [
      { find: '@unovis/react', replacement: resolve(__dirname, './src') },
      { find: /^src\//, replacement: `${resolve(__dirname, './src')}/` },
    ],
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: externalRegexes,
      output,
    },
  },
})
