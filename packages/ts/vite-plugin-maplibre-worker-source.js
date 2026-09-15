import { createRequire } from 'node:module'
import path from 'node:path'
import { build } from 'vite'

// Serves `virtual:maplibre-worker-source`: maplibre-gl's web worker bundled into one self-contained
//   script and exported as a string. `LeafletMap` starts the worker from a Blob URL of it, so the
//   MapLibre renderer works regardless of how the consumer's bundler treats maplibre-gl's worker files
//   (webpack doesn't follow `import.meta.url` in dependencies; Vite emits the `.mjs` files with names
//   and MIME types stock web servers won't run as a module worker). Bundling from the installed
//   maplibre-gl's own worker entry keeps the worker in sync with the version the library imports.
export const MAPLIBRE_WORKER_SOURCE_ID = 'virtual:maplibre-worker-source'
// Where the module lands in `dist` (instead of rollup's `_virtual/` folder); the dev gallery aliases the virtual id to it
export const MAPLIBRE_WORKER_SOURCE_DIST_PATH = 'components/leaflet-map/modules/maplibre-worker-source.js'
const resolvedId = `\0${MAPLIBRE_WORKER_SOURCE_ID}`
const require = createRequire(import.meta.url)

async function bundleMaplibreWorker () {
  const result = await build({
    configFile: false,
    logLevel: 'warn',
    build: {
      write: false,
      minify: 'esbuild',
      sourcemap: false,
      target: 'es2020',
      lib: {
        entry: require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs'),
        formats: ['iife'],
        name: 'maplibreWorker',
        fileName: () => 'maplibre-gl-worker.js',
      },
    },
  })

  const outputs = (Array.isArray(result) ? result : [result]).flatMap(r => r.output)
  const chunks = outputs.filter(o => o.type === 'chunk')
  if (chunks.length !== 1) throw new Error(`Expected a single self-contained maplibre-gl worker chunk, got ${chunks.length}`)
  const [chunk] = chunks

  // The worker registers itself with `self.worker = new Worker(self)` at the top level. maplibre-gl marks
  //   its dist files as side-effect free, so an overly eager tree-shake can strip that and leave a
  //   "successful" but empty worker; guard against it explicitly instead of trusting the file size.
  if (!/self\.worker\s*=\s*new\s+\w+\(self\)/.test(chunk.code)) throw new Error('maplibre-gl worker bundle is missing its top-level worker registration')
  if (chunk.imports.length || chunk.dynamicImports.length) throw new Error(`maplibre-gl worker bundle must not import other chunks: ${[...chunk.imports, ...chunk.dynamicImports].join(', ')}`)
  if (/import\.meta/.test(chunk.code)) throw new Error('maplibre-gl worker bundle must not rely on `import.meta`')

  return chunk.code
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
      source ??= bundleMaplibreWorker()
      // The version lets `LeafletMap` detect a main-thread maplibre-gl that differs from the one the worker was built from
      const { version } = require('maplibre-gl/package.json')
      return source.then(code => `export default ${JSON.stringify(code)}\nexport const version = ${JSON.stringify(version)}`)
    },
    // `preserveModules` ignores custom `entryFileNames`/`chunkFileNames` for this dynamic-import-only
    //   virtual module and always emits it under `_virtual/` - rename the emitted chunk here instead
    //   and patch up every import specifier that points at it.
    generateBundle (_, bundle) {
      const entry = Object.entries(bundle)
        .find(([, chunkInfo]) => chunkInfo.type === 'chunk' && chunkInfo.facadeModuleId === resolvedId)
      if (!entry) return
      const [oldFileName, workerChunk] = entry
      if (oldFileName === MAPLIBRE_WORKER_SOURCE_DIST_PATH) return

      workerChunk.fileName = MAPLIBRE_WORKER_SOURCE_DIST_PATH
      const relativeSpecifier = (fromFileName, toFileName) => {
        const rel = path.posix.relative(path.posix.dirname(fromFileName), toFileName)
        return rel.startsWith('.') ? rel : `./${rel}`
      }
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || chunk === workerChunk) continue
        if (!chunk.imports.includes(oldFileName) && !chunk.dynamicImports.includes(oldFileName)) continue

        const oldSpecifier = relativeSpecifier(chunk.fileName, oldFileName)
        const newSpecifier = relativeSpecifier(chunk.fileName, MAPLIBRE_WORKER_SOURCE_DIST_PATH)
        chunk.code = chunk.code.split(oldSpecifier).join(newSpecifier)
        chunk.imports = chunk.imports.map(i => (i === oldFileName ? MAPLIBRE_WORKER_SOURCE_DIST_PATH : i))
        chunk.dynamicImports = chunk.dynamicImports.map(i => (i === oldFileName ? MAPLIBRE_WORKER_SOURCE_DIST_PATH : i))
      }
    },
  }
}
