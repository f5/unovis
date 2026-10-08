import { createRequire } from 'node:module'

// Serves `virtual:maplibre-worker-source`: maplibre-gl's web worker bundled into one self-contained
//   script and exported as a string. `LeafletMap` starts the worker from a Blob URL of it, so the
//   MapLibre renderer works regardless of how the consumer's bundler treats maplibre-gl's worker files
//   (webpack doesn't follow `import.meta.url` in dependencies; Vite emits the `.mjs` files with names
//   and MIME types stock web servers won't run as a module worker). Bundling from the installed
//   maplibre-gl's own worker entry keeps the worker in sync with the version this package depends on.
export const MAPLIBRE_WORKER_SOURCE_ID = 'virtual:maplibre-worker-source'
const entryFileName = 'components/leaflet-map/modules/maplibre-worker-source.js'
// Where the module actually lands in `dist`: Rollup prepends `_virtual/` on top of `entryFileName` on its own
//   for non-absolute virtual module ids when `preserveModules` is on; the dev gallery aliases the virtual id to this
export const MAPLIBRE_WORKER_SOURCE_DIST_PATH = `_virtual/${entryFileName}`
const resolvedId = `\0${MAPLIBRE_WORKER_SOURCE_ID}`
const require = createRequire(import.meta.url)

async function bundleMaplibreWorker () {
  // Only the installed `esbuild` is used here, purely as a library to bundle the worker into a
  //   self-contained script; this package's own build otherwise still runs entirely on Rollup.
  const { build } = await import('esbuild')
  const result = await build({
    entryPoints: [require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs')],
    bundle: true,
    write: false,
    minify: true,
    sourcemap: false,
    target: 'es2020',
    format: 'iife',
    globalName: 'maplibreWorker',
  })

  const [chunk] = result.outputFiles
  if (result.outputFiles.length !== 1) throw new Error(`Expected a single self-contained maplibre-gl worker chunk, got ${result.outputFiles.length}`)

  // The worker registers itself with `self.worker = new Worker(self)` at the top level. maplibre-gl marks
  //   its dist files as side-effect free, so an overly eager tree-shake can strip that and leave a
  //   "successful" but empty worker; guard against it explicitly instead of trusting the file size.
  if (!/self\.worker\s*=\s*new\s+\w+\(self\)/.test(chunk.text)) throw new Error('maplibre-gl worker bundle is missing its top-level worker registration')
  if (/import\.meta/.test(chunk.text)) throw new Error('maplibre-gl worker bundle must not rely on `import.meta`')

  return chunk.text
}

export function maplibreWorkerSource () {
  let source
  return {
    name: 'unovis:maplibre-worker-source',
    resolveId (id) {
      if (id === MAPLIBRE_WORKER_SOURCE_ID) return resolvedId
    },
    load (id) {
      if (id !== resolvedId) return
      source = source || bundleMaplibreWorker()
      // The version lets `LeafletMap` detect a main-thread maplibre-gl that differs from the one the worker was built from
      const { version } = require('maplibre-gl/package.json')
      return source.then(code => `export default ${JSON.stringify(code)}\nexport const version = ${JSON.stringify(version)}`)
    },
    outputOptions (options) {
      const { entryFileNames = '[name].js' } = options
      return {
        ...options,
        entryFileNames: chunk => chunk.facadeModuleId === resolvedId
          ? entryFileName
          : (typeof entryFileNames === 'string' ? entryFileNames : entryFileNames(chunk)),
      }
    },
  }
}
