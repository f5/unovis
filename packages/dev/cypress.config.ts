import { defineConfig } from 'cypress'
// import webpackConfig from './webpack.config'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9500',
    setupNodeEvents (on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
})
