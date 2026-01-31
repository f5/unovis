import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import type { ModuleFormat, OutputOptions } from 'rollup'

const outputDefault = (format: ModuleFormat, extension: string): OutputOptions => ({
  // Provide global variables to use in the UMD build
  // for externalized deps
  globals: {
    '@unovis/ts': '@unovis/ts',
  },
  preserveModules: true,
  preserveModulesRoot: './src',
  format,
  entryFileNames: ({ name }) => {
    return `${name}.${extension}`
  },
  exports: 'named',
})

// @ts-expect-error
export default defineConfig(({command, mode}) => {
  if (command === 'build' && mode !== 'gallery') {
    return {
      plugins:[solid(), dts()],
      build: {
        emptyOutDir: true,
        lib: {
          name: '@unovis/solid',
          fileName: 'index',
          entry: resolve(__dirname, 'src/index.ts')
        },
        sourcemap: true,
        rollupOptions: {
          // make sure to externalize deps that shouldn't be bundled
          // into your library
          external: ['solid-js', 'solid-js/web', 'solid-js/store', '@unovis/ts', 'tslib'],
          output: [outputDefault('cjs', 'cjs'), outputDefault('es', 'js')]
        }
      },
    }
  } else {
    return {
      plugins: [solid()],
      build: {
        outDir: "dist-demo"
      },
      resolve: {
        alias: {
          '@unovis/solid': resolve(__dirname, 'src/index.ts'),
          'tslib': 'tslib'
        }
      },
      optimizeDeps: {
        include: ['tslib']
      }
    }
  }
})
