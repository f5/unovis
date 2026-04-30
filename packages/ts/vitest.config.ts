import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        'src/**/*.d.ts',
        'src/maps/**',
        'src/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      types: resolve(__dirname, 'src/types'),
      utils: resolve(__dirname, 'src/utils'),
      core: resolve(__dirname, 'src/core'),
      components: resolve(__dirname, 'src/components'),
      styles: resolve(__dirname, 'src/styles'),
      'data-models': resolve(__dirname, 'src/data-models'),
    },
  },
})
