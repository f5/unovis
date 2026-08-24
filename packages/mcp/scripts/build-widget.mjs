/* Bundles the browser widget (Unovis + the shared spec materializer) into a
 * single self-contained IIFE at dist/widget/bundle.js.
 *
 * Leaflet/MapLibre/Three are excluded by importing components directly (see
 * src/widget/unovis-slim.ts) and stubbed as a safety net in case a transitive
 * import sneaks in.
 *
 * Run: pnpm build:widget (chained from pnpm build)
 */
import { build } from 'esbuild'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outfile = join(root, 'dist', 'widget', 'bundle.js')
mkdirSync(dirname(outfile), { recursive: true })

// Excluded from the bundle:
//  - leaflet/maplibre-gl/three: only used by the map components charts never render
//  - elkjs: a 1.4MB layout engine behind a dynamic import that an IIFE bundle
//    would inline. ELK works for static rendering via a hand-written spec, so
//    it is deliberately absent from the tool's layout options.
// dagre (with graphlibrary) is bundled — it costs ~80kB and keeps every layout
// the tools expose working in interactive output too.
const stubbed = ['leaflet', 'maplibre-gl', 'three', 'elkjs']
const stubPlugin = {
  name: 'stub-browser-only-deps',
  setup (pluginBuild) {
    const filter = new RegExp(`^(${stubbed.join('|')})(/|$)`)
    pluginBuild.onResolve({ filter }, args => ({ path: args.path, namespace: 'stub' }))
    pluginBuild.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default {}', loader: 'js' }))
  },
}

const result = await build({
  entryPoints: [join(root, 'src', 'widget', 'entry.ts')],
  outfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  plugins: [stubPlugin],
  define: {
    // Reported by the unovis:ready handshake so hosts can assert compatibility
    __UNOVIS_MCP_VERSION__: JSON.stringify(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version),
  },
  logLevel: 'warning',
  metafile: true,
})

const { size: bytes } = statSync(outfile)
const heaviest = Object.entries(result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].inputs)
  .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
  .slice(0, 5)
  .map(([file, info]) => `${file.replace(/^.*node_modules\//, '')} ${(info.bytesInOutput / 1024).toFixed(0)}kB`)

// Guard against the barrel (and its browser-only deps) creeping back in
const LIMIT_KB = 900
if (bytes / 1024 > LIMIT_KB) {
  console.error(`✗ widget bundle is ${(bytes / 1024).toFixed(0)}kB, over the ${LIMIT_KB}kB budget`)
  console.error(`  heaviest inputs: ${heaviest.join(', ')}`)
  process.exit(1)
}

writeFileSync(join(root, 'dist', 'widget', 'bundle.meta.json'), JSON.stringify({ bytes }, null, 2))
console.error(`✓ widget bundle: ${(bytes / 1024).toFixed(0)}kB → ${outfile}`)
console.error(`  heaviest inputs: ${heaviest.join(', ')}`)
