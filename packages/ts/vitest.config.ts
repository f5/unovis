import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/**/*.ssr.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/**/*.ssr.spec.ts'],
        },
      },
    ],
  },
}))
