import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import pkg from './package.json'


const external = [
  ...Object.keys(pkg.dependencies || {}),
  /d3-/,
  /node_modules/,
  /^three\/.*/,
]

export default defineConfig({
  build: {
    sourcemap: true,
    cssMinify: 'lightningcss',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        maps: resolve(__dirname, 'src/maps.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external,
      treeshake: false,
      preserveEntrySignatures: 'strict',
      output: {
        preserveModules: true,
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        preserveModulesRoot: 'src',
      },
    },
  },
  plugins: [
    dts(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
