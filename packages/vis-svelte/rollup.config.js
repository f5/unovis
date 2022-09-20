import resolve from '@rollup/plugin-node-resolve'
import transformPaths from '@zerollup/ts-transform-paths'
import commonjs from 'rollup-plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import sveld from 'sveld'
import sveltePreprocess from 'svelte-preprocess'

import pkg from './package.json'

// Excluded dependencies
const externals = Object.keys(pkg.devDependencies)

const regexesOfPackages = externals // To prevent having node_modules in the build files
  .map(packageName => new RegExp(`^${packageName}(/.*)?`))

// Array of extensions to be handled by babel
const extensions = ['.js', '.ts', '.svelte', '.css']

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    sourcemap: true,
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: './src',
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
      preprocess: sveltePreprocess(),
    }),
    typescript({
      typescript: require('typescript'),
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
    sveld({
      typesOptions: {
        outDir: 'dist',
      },
    }),
    terser(),
    peerDepsExternal(),
  ],
  external: regexesOfPackages,
}
