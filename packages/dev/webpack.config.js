/* eslint-disable @typescript-eslint/no-var-requires */
const { DefinePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const path = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production'
module.exports = {
  entry: './src/index.tsx',
  devtool: 'source-map',
  mode: isDevelopment ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
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
              transpileOnly: isDevelopment,
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
      utils: path.resolve(__dirname, '../ts/src/utils/'),
      components: path.resolve(__dirname, '../ts/src/components/'),
      containers: path.resolve(__dirname, '../ts/src/containers/'),
      types: path.resolve(__dirname, '../ts/src/types/'),
      data: path.resolve(__dirname, '../ts/src/data/'),
      core: path.resolve(__dirname, '../ts/src/core/'),
      styles: path.resolve(__dirname, '../ts/src/styles/'),
      'data-models': path.resolve(__dirname, '../ts/src/data-models/'),

      // Unovis React
      '@unovis/react': path.resolve(__dirname, '../react/src/'),
      'src/utils/react': path.resolve(__dirname, '../react/src/utils/react'),
    },
  },
  devServer: {
    port: 9500,
    open: false,
    hot: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      hash: true,
      filename: '../dist/index.html',
    }),
    new DefinePlugin({
      UNOVIS_MAP_TILE_SERVER_API_KEY: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_API_KEY),
      UNOVIS_MAP_TILE_SERVER_URL: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_URL),
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
}
