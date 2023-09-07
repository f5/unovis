import typescript from 'rollup-plugin-typescript2'
import ttypescript from 'ttypescript'

const plugins = [
  typescript({
    typescript: ttypescript,
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
