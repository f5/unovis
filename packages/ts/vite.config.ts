import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import pkg from './package.json'


const external = [
  ...Object.keys(pkg.dependencies || {}).map((dep) => new RegExp(`^${dep}(/.*)?$`)),
  /d3-/,
]

export default defineConfig({
  build: {
    outDir: 'dist',
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
      types: resolve(__dirname, 'src/types'),
      utils: resolve(__dirname, 'src/utils'),
      core: resolve(__dirname, 'src/core'),
      components: resolve(__dirname, 'src/components'),
      styles: resolve(__dirname, 'src/styles'),
      'data-models': resolve(__dirname, 'src/data-models'),
    },
  },
})
