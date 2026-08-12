import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'

const extensions = ['.ts']
const plugins = [
  resolve({
    extensions,
  }),
  commonjs(),
  typescript({
    tsconfig: './autogen/tsconfig.json',
    typescript: require('typescript'),
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['**/*.d.ts'],
  }),
]

export default [
  {
    input: './autogen/index.ts',
    output: [
      {
        file: '.autogen.cjs',
        format: 'cjs',
      },
    ],
    plugins,
  },
]
