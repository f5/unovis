import typescript from 'rollup-plugin-typescript2'

const plugins = [
  typescript({
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
