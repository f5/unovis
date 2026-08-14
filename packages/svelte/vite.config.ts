import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    dedupe: ['svelte'],
    alias: {
      '@unovis/svelte': resolve(dirname(fileURLToPath(import.meta.url)), 'src/index.ts'),
    },
  },
})
