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

// The standard variant re-exports the subset named in src/widget/variants.ts.
// unovis-slim.ts stays the one place import paths live: filter its lines.
const variantsSource = readFileSync(join(root, 'src', 'widget', 'variants.ts'), 'utf8')
const standardNames = new Set([...variantsSource.matchAll(/'([A-Za-z]+)'/g)].map(m => m[1])
  .filter(name => !['standard', 'full'].includes(name)))
const slimSource = readFileSync(join(root, 'src', 'widget', 'unovis-slim.ts'), 'utf8')
const standardSlim = slimSource.split('\n')
  .filter(line => {
    const name = line.match(/^export \{ (\w+) \}/)?.[1]
    return !name || standardNames.has(name)
  })
  .join('\n')

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

const standardOutfile = join(root, 'dist', 'widget', 'bundle.standard.js')
await build({
  entryPoints: [join(root, 'src', 'widget', 'entry.ts')],
  outfile: standardOutfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  plugins: [stubPlugin, {
    name: 'standard-slim',
    setup (pluginBuild) {
      pluginBuild.onLoad({ filter: /unovis-slim\.ts$/ }, () => ({ contents: standardSlim, loader: 'ts', resolveDir: join(root, 'src', 'widget') }))
    },
  }],
  define: {
    __UNOVIS_MCP_VERSION__: JSON.stringify(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version),
  },
  logLevel: 'warning',
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

const standardBytes = statSync(standardOutfile).size
// The variant exists to be small — fail the build when it stops paying rent
if (standardBytes / 1024 > 480 || standardBytes >= bytes * 0.8) {
  console.error(`✗ standard bundle is ${(standardBytes / 1024).toFixed(0)}kB — too close to the full bundle to justify shipping two`)
  process.exit(1)
}

writeFileSync(join(root, 'dist', 'widget', 'bundle.meta.json'), JSON.stringify({ bytes, standardBytes }, null, 2))
console.error(`✓ widget bundle: ${(bytes / 1024).toFixed(0)}kB → ${outfile}`)
console.error(`✓ standard variant: ${(standardBytes / 1024).toFixed(0)}kB → ${standardOutfile}`)

// The self-extracting bootstrap: inflates the gzip+base64 payload that chart
// documents carry instead of the raw bundle (~3× smaller files on disk)
const unpackFile = join(root, 'dist', 'widget', 'unpack.js')
await build({
  entryPoints: [join(root, 'src', 'widget', 'unpack.ts')],
  outfile: unpackFile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'warning',
})
const unpackBytes = statSync(unpackFile).size
if (unpackBytes / 1024 > 15) {
  console.error(`✗ unpack bootstrap is ${(unpackBytes / 1024).toFixed(1)}kB — it must stay trivially small`)
  process.exit(1)
}
console.error(`✓ unpack bootstrap: ${(unpackBytes / 1024).toFixed(1)}kB → ${unpackFile}`)
console.error(`  heaviest inputs: ${heaviest.join(', ')}`)
