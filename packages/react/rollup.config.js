import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'
import transformPaths from '@zerollup/ts-transform-paths'
import postcss from 'rollup-plugin-postcss'
import json from '@rollup/plugin-json'
import renameNodeModules from 'rollup-plugin-rename-node-modules'
import packageJson from './package.json' assert { type: 'json' }
import ts from 'typescript'

// Array of extensions to be handled by babel
const extensions = ['.ts', '.tsx']

// Excluded dependencies
const externals = [
  ...Object.keys(packageJson.devDependencies),
]

const regexesOfPackages = externals // To prevent having node_modules in the build files
  .map(packageName => new RegExp(`^${packageName}(/.*)?`))

export default {
  input: ['src/index.ts'],
  output: {
    dir: 'dist',
    sourcemap: true,
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: './src',
  },
  plugins: [
    json(),
    peerDepsExternal(),
    resolve({
      extensions,
    }),
    postcss({
      modules: true,
    }),
    typescript({
      typescript: ts,
      tsconfig: './tsconfig.lib.json',
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
    renameNodeModules(),
  ],
  external: regexesOfPackages,
}
