import svelte from 'rollup-plugin-svelte'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import transformPaths from '@zerollup/ts-transform-paths'
import typescript from 'rollup-plugin-typescript2'
import sveld from 'sveld'
import devServer from 'rollup-plugin-dev'
import copy from 'rollup-plugin-copy'
import commonjs from 'rollup-plugin-commonjs'

import pkg from './package.json'

const dev = process.env.ROLLUP_WATCH

// Excluded dependencies
const externals = Object.keys(pkg.devDependencies)

const regexesOfPackages = externals // To prevent having node_modules in the build files
  .map(packageName => new RegExp(`^${packageName}(/.*)?`))

// Array of extensions to be handled by babel
const extensions = ['.js', '.ts', '.svelte', '.css']

export default {
  input: [dev ? 'src-demo/index.ts' : 'src/index.ts'],
  output: {
    dir: dev ? 'dist-demo' : 'dist',
    sourcemap: true,
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: dev ? './src-demo' : './src',
  },
  plugins: [
    commonjs(),
    resolve({
      browser: true,
      extensions,
      mainFields: ['jsnext:main', 'module', 'main', 'browser'],
      dedupe: ['svelte'],
    }),
    svelte({
      emitCss: false,
      preprocess: sveltePreprocess({ sourceMap: dev }),
      compilerOptions: {
        dev: dev,
      },
    }),
    typescript({
      typescript: require('typescript'),
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
    sveld({
      typesOptions: {
        outDir: dev ? 'dist-demo' : 'dist',
      },
    }),
    dev ? devServer({ dirs: ['dist-demo'], port: 9200 }) : terser(),
    dev ? copy({
      targets: [
        { src: 'src-demo/index.html', dest: 'dist-demo' },
      ],
    }) : peerDepsExternal(),
  ],
  external: dev ? undefined : regexesOfPackages,
}
