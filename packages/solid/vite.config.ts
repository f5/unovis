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
          // into your library. The regex also covers granular `@unovis/ts` subpaths
          // (`@unovis/ts/components/area`), which a plain string wouldn't match —
          // Rollup would then inline the core library into this bundle.
          external: ['solid-js', 'solid-js/web', 'solid-js/store', /^@unovis\/ts(\/.*)?$/, 'tslib'],
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
          // The wrappers import granular subpaths (`@unovis/ts/components/area`), which only
          // exist under `packages/ts/dist` — the root of the published tarball, but not of the
          // workspace package. `packages/dev` and `packages/shared` alias `@unovis/ts` the same way.
          '@unovis/ts': resolve(__dirname, '../ts/dist'),
          'tslib': 'tslib'
        }
      },
      optimizeDeps: {
        include: ['tslib']
      }
    }
  }
})
