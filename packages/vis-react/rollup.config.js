// Copyright (c) Volterra, Inc. All rights reserved.
import resolve from '@rollup/plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'
import transformPaths from '@zerollup/ts-transform-paths'
import pkg from './package.json'

// Array of extensions to be handled by babel
const extensions = ['.ts', '.tsx']

// Excluded dependencies
const externals = [
  ...Object.keys(pkg.devDependencies),
  'lodash/isEqual',
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
    peerDepsExternal(),
    resolve({
      extensions,
    }),
    typescript({
      typescript: require('typescript'),
      tsconfig: './tsconfig.lib.json',
      transformers: [(service) => transformPaths(service.getProgram())],
    }),
  ],
  external: regexesOfPackages,
}
