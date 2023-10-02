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
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: './src',
  format,
  entryFileNames: ({ name }) => {
    return `${name.replace('.vue', '')}.${extension}`
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }): UserConfig => {
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
          // make sure to externalize deps that shouldn't be bundled
          // into your library (Vue)
          external: ['vue', '@unovis/ts'],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore overloaded issue
          output: [outputDefault('cjs', 'cjs'), outputDefault('es', 'js')],
        },
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
    }
  }
})
