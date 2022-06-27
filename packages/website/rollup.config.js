import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import sveltePreprocess from 'svelte-preprocess'
import transformPaths from '@zerollup/ts-transform-paths'
import typescript from 'rollup-plugin-typescript2'
import sveld from 'sveld'
import devServer from 'rollup-plugin-dev'
import copy from 'rollup-plugin-copy'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'


export default {
  input: ['src/index.ts'],
  output: {
    dir: 'dist-demo',
    sourcemap: true,
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: './src',
  },
  plugins: [
    postcss({
      plugins: [],
      inject: true,
      minimize: true,
    }),
    commonjs(),
    resolve({
      browser: true,
      extensions: ['.js', '.ts', '.svelte'],
      dedupe: ['svelte'],
    }),
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: true,
      }),
      compilerOptions: {
        dev: true,
      },
    }),
    typescript({
      typescript: require('typescript'),
      tsconfig: 'tsconfig.svelte.json',
      abortOnError: false,
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
    sveld({
      typesOptions: {
        outDir: 'dist-demo',
      },
    }),
    devServer({ dirs: ['dist-demo'], port: 9200 }),
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist-demo' },
      ],
    }),
  ],
}
