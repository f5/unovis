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

// maplibre-gl's `dist` directory, resolved through pnpm's nested layout.
const maplibreDist = path.dirname(require.resolve('maplibre-gl/dist/maplibre-gl.mjs'))
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
      {
        // maplibre-gl's worker imports its `maplibre-gl-shared*.mjs` sibling via a relative path,
        //   so both must be emitted next to each other with their original (unhashed) file names.
        //   Gated behind the `?maplibreWorkerAsset` query marker (used by the `new URL(...)` calls in
        //   `map.ts`) so the normal ESM `import` inside maplibre-gl(-dev).mjs is unaffected and keeps
        //   its real named exports. Matches the `-dev` builds too (see the maplibre-gl alias below).
        test: /maplibre-gl-(worker|shared)(-dev)?\.mjs$/,
        resourceQuery: /maplibreWorkerAsset/,
        type: 'asset/resource',
        generator: { filename: '[name][ext]' },
      },
      {
        // maplibre-gl(-dev).mjs builds its worker Blob URL with a dynamic `new URL(var, import.meta.url)`
        //   that webpack can't statically resolve; relaxing the `new URL()` parser removes the
        //   "Critical dependency" warning at its source. The module type is left as webpack's default
        //   so the ESM named exports stay intact.
        test: /maplibre-gl(-dev)?\.mjs$/,
        parser: { url: false },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.tsx'],
    alias: {
      // maplibre-gl 6.x ships ESM split across `maplibre-gl.mjs` + `maplibre-gl-shared.mjs`. webpack
      //   mis-links a namespace access to a *minified* renamed export (`Transform#clone` reads the
      //   shared module's transform helper), so the map crashes on construction with
      //   "e.apply is not a function". The non-minified `*-dev.mjs` build links correctly. This dev
      //   gallery isn't size-sensitive, so pin it (and its worker sibling) to the dev build.
      'maplibre-gl$': path.join(maplibreDist, 'maplibre-gl-dev.mjs'),
      'maplibre-gl/dist/maplibre-gl-worker.mjs': path.join(maplibreDist, 'maplibre-gl-worker-dev.mjs'),
      'maplibre-gl/dist/maplibre-gl-shared.mjs': path.join(maplibreDist, 'maplibre-gl-shared-dev.mjs'),

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
