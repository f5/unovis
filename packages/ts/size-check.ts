/* eslint-disable no-console */
// Measures how much of `dist/` a few typical charts pull into an app bundle and compares the result
// with `size-baseline.json`. Run after `pnpm build`; `pnpm size --update` rewrites the baseline.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'

type Size = { min: number; gzip: number }

const packageDir = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(packageDir, 'dist')
const baselinePath = resolve(packageDir, 'size-baseline.json')

/** Gzip bytes a scenario may grow by before the check fails */
const MAX_GZIP_GROWTH = 512

/** What each scenario imports from `dist/index.js`; everything else is tree-shaken away, as in an app */
const scenarios: Record<string, string> = {
  'xy-container-line': 'XYContainer, Line',
  'line-chart': 'XYContainer, Line, Axis, Crosshair, Tooltip, BulletLegend',
  'stacked-bar-area': 'XYContainer, StackedBar, Area, Axis',
  donut: 'SingleContainer, Donut',
  sankey: 'SingleContainer, Sankey',
  graph: 'SingleContainer, Graph',
  'topojson-map': 'SingleContainer, TopoJSONMap',
  'leaflet-map': 'SingleContainer, LeafletMap',
}

async function measure (exports: string): Promise<Size> {
  const result = await build({
    stdin: { contents: `export { ${exports} } from './index.js'`, resolveDir: distDir, loader: 'js' },
    absWorkingDir: packageDir,
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2020',
    splitting: true,
    outdir: 'size-check-out',
    write: false,
    metafile: true,
    logLevel: 'silent',
  })

  // Lazy dependencies (leaflet, maplibre, elk, ...) land in dynamic chunks; count only what loads with the entry
  const outputs = result.metafile.outputs
  const initial = new Set<string>()
  const queue = Object.keys(outputs).filter(file => outputs[file].entryPoint === '<stdin>')
  while (queue.length) {
    const file = queue.pop()
    if (initial.has(file)) continue
    initial.add(file)
    for (const imp of outputs[file].imports) {
      if (imp.kind !== 'dynamic-import' && outputs[imp.path]) queue.push(imp.path)
    }
  }

  const code = Buffer.concat(
    result.outputFiles
      .filter(file => initial.has(relative(packageDir, file.path).split(sep).join('/')))
      .map(file => file.contents)
  )
  return { min: code.length, gzip: gzipSync(code, { level: 9 }).length }
}

function format (bytes: number): string {
  return bytes.toLocaleString('en-US').padStart(9)
}

async function main (): Promise<void> {
  const update = process.argv.includes('--update')
  const baseline: Record<string, Size> = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {}
  const results: Record<string, Size> = {}
  const regressions: string[] = []

  for (const [name, exports] of Object.entries(scenarios)) {
    const size = await measure(exports)
    results[name] = size
    const growth = baseline[name] ? size.gzip - baseline[name].gzip : undefined
    if (growth !== undefined && growth > MAX_GZIP_GROWTH) regressions.push(name)
    const delta = growth === undefined ? 'new' : `${growth >= 0 ? '+' : ''}${growth} B gzip`
    console.log(`${name.padEnd(18)} ${format(size.min)} min  ${format(size.gzip)} gzip  (${delta})`)
  }

  if (update) {
    writeFileSync(baselinePath, `${JSON.stringify(results, null, 2)}\n`)
    console.log(`Baseline written to ${relative(process.cwd(), baselinePath)}`)
  } else if (regressions.length) {
    console.error(`\nGzip size grew by more than ${MAX_GZIP_GROWTH} B: ${regressions.join(', ')}`)
    console.error('If that is intended, run `pnpm size --update` in packages/ts and commit size-baseline.json')
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
