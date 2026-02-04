import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 9500,
  },
  preview: {
    port: 9501,
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    outDir: resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UNOVIS_MAP_TILE_SERVER_URL: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_URL ?? ''),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UNOVIS_MAP_TILE_SERVER_API_KEY: JSON.stringify(process.env.UNOVIS_MAP_TILE_SERVER_API_KEY ?? ''),
  },
  optimizeDeps: {
    exclude: ['elkjs'],
  },
})
