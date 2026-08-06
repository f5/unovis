import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { UserConfig, defineConfig } from 'vite'
import type { ModuleFormat, OutputOptions } from 'rollup'


const outputDefault = (format: ModuleFormat, extension: string): OutputOptions => ({
  // Provide global variables to use in the UMD build
  // for externalized deps
  globals: {
    vue: 'Vue',
    '@unovis/ts': '@unovis/ts',
  },
  preserveModules: true,
  preserveModulesRoot: './src',
  format,
  entryFileNames: ({ name }) => {
    return `${name.replace('.vue', '')}.${extension}`
  },
  exports: 'named',
})

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  if (command === 'build' && mode !== 'gallery') {
    return {
      plugins: [
        vue(),
        dts({
          cleanVueFileName: true,
        }),
        cssInjectedByJsPlugin(),
      ],
      build: {
        emptyOutDir: true,
        lib: {
          name: '@unovis/vue',
          fileName: 'index',
          entry: resolve(__dirname, 'src/index.ts'),
        },
        rollupOptions: {
          // The regex also covers granular subpaths (`@unovis/ts/components/area`), which the
          // wrappers import instead of the root barrel. A plain string would only match the
          // bare specifier and Rollup would inline the core library into this bundle.
          external: ['vue', /^@unovis\/ts(\/.*)?$/],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore overloaded issue
          output: [outputDefault('cjs', 'cjs'), outputDefault('es', 'js')],
        },
        sourcemap: true,
      },
    }
  } else {
    return {
      plugins: [
        vue(),
      ],
      build: {
        outDir: 'dist-demo',
      },
      resolve: {
        alias: {
          '@unovis/vue': resolve(__dirname, 'src/index.ts'),
          // The wrappers import granular subpaths (`@unovis/ts/components/area`). Those only
          // exist under `packages/ts/dist`, which is the root of the published tarball but not
          // of the workspace package, so they need an explicit alias here. `packages/dev` and
          // `packages/shared` alias `@unovis/ts` the same way.
          '@unovis/ts': resolve(__dirname, '../ts/dist'),
        },
      },
    }
  }
})
