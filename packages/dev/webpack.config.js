/* eslint-disable @typescript-eslint/no-var-requires */
const { DefinePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production'
const publicPath = process.env.UNOVIS_EXAMPLES_BASE || '/'
const baseHref = publicPath.endsWith('/') ? publicPath : `${publicPath}/`
module.exports = {
  entry: './src/index.tsx',
  devtool: 'source-map',
  mode: isDevelopment ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
              }),
              // TODO: Enable for the prod build after fixing TS errors
              transpileOnly: true, // isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[local]', // Using '[local]' for importing Leaflet's global styles correctly. See `ts/src/components/leaflet-map/leaflet.css`.
                exportLocalsConvention: 'camelCaseOnly',
              },
            },
          },
        ],
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.tsx'],
    alias: {
      // React
      react: path.resolve('./node_modules/react'),

      // Project's src
      '@src': path.resolve(__dirname, './src/'),

      // Unovis Core
      '@unovis/ts': path.resolve(__dirname, '../ts/src/'),
      '@': path.resolve(__dirname, '../ts/src/'),

      // Unovis React
      '@unovis/react': path.resolve(__dirname, '../react/src/'),
      'src/utils/react': path.resolve(__dirname, '../react/src/utils/react'),

      // Unovis Shared
      '@unovis/shared': path.resolve(__dirname, '../shared/'),
    },
  },
  devServer: {
    port: 9500,
    open: false,
    hot: true,
    historyApiFallback: true,
    static: [
      {
        directory: path.resolve(__dirname, './src/examples'),
        publicPath: '/examples',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      hash: true,
      filename: '../dist/index.html',
      favicon: path.join(__dirname, 'public/favicon.svg'),
      baseHref,
    }),
    new DefinePlugin({
      UNOVIS_MAP_TILE_SERVER_API_KEY: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_API_KEY),
      UNOVIS_MAP_TILE_SERVER_URL: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_URL),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || (isDevelopment ? 'development' : 'production')),
      __UNOVIS_HASH_ROUTER__: JSON.stringify(Boolean(process.env.UNOVIS_EXAMPLES_BASE)),
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/examples', to: 'examples' }],
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
}
