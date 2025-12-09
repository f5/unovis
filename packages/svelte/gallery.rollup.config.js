import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import sveltePreprocess from 'svelte-preprocess'
import transformPaths from '@zerollup/ts-transform-paths'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import copy from 'rollup-plugin-copy'
import commonjs from 'rollup-plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  input: ['src-demo/svelte-gallery.ts'],
  output: {
    dir: 'dist-demo',
    sourcemap: true,
    format: 'esm',
  },
  plugins: [
    alias({
      entries: [
        { find: '@unovis/svelte', replacement: path.resolve(__dirname, 'src/index.ts') },
      ],
    }),
    commonjs(),
    resolve({
      browser: true,
      extensions: ['.js', '.ts', '.svelte'],
      exportConditions: ['svelte', 'default'],
      dedupe: ['svelte'],
    }),
    typescript({
      typescript: require('typescript'),
      tsconfig: 'tsconfig.json',
      abortOnError: false,
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
    svelte({
      emitCss: false,
      preprocess: sveltePreprocess({
        sourceMap: true,
      }),
      compilerOptions: {
        dev: true,
      },
    }),
    copy({
      targets: [
        { src: 'src-demo/svelte-gallery.html', dest: 'dist-demo', rename: '/index.html' },
      ],
    }),
    serve({
      contentBase: 'dist-demo',
      port: 9200,
      open: true,
    }),
    livereload('dist-demo'),
  ],
}
