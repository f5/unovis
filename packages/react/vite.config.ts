import { resolve as resolvePath } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react(), externalizeDeps()].concat(isProduction ? [
      dts({ tsconfigPath: './tsconfig.lib.json' }),
    ] : []),
    build: {
      emptyOutDir: isProduction,
      sourcemap: true,
      minify: false,
      outDir: resolvePath(__dirname, 'dist'),

      lib: {
        entry: resolvePath(__dirname, 'src/index.ts'),
        formats: ['es'],
      },

      rollupOptions: {
        output: {
          globals: {
            react: 'React',
            '@unovis/ts': '@unovis/ts',
          },
          preserveModules: true,
          preserveModulesRoot: './src',
          format: 'es',
          entryFileNames: ({ name }) => {
            return `${name.replace('.vue', '')}.js`
          },
          exports: 'named',
        },
      },
    },
    resolve: {
      alias: {
        '@': resolvePath(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
  }
})
