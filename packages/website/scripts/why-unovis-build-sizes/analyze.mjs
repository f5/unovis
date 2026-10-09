// Reads <outDir>/variants.tsv (written by measure.sh) and the esbuild metafiles, measures each bundle
// and writes <outDir>/report.md + <outDir>/sizes.json.
//   min    = bytes of the minified bundle on disk
//   gzip   = `gzip -9 -c <file> | wc -c` (exactly; includes gzip's ~20-byte header with the file name)
//   brotli = Node zlib brotli, quality 11 (max), text mode
// KB = 1024 bytes.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { execFileSync } from 'node:child_process'

const outDir = process.argv[2] ?? 'dist'
const variants = fs.readFileSync(path.join(outDir, 'variants.tsv'), 'utf8').trim().split('\n').map((line) => {
  const [id, group, library, variant, entry] = line.split('\t')
  return { id, group, library, variant, entry }
})

const kb = (bytes) => (bytes / 1024).toFixed(1)
const gzipSize = (file) => Number(execFileSync('sh', ['-c', 'gzip -9 -c "$1" | wc -c', 'sh', file], { encoding: 'utf8' }).trim())
const brotliSize = (buf) => zlib.brotliCompressSync(buf, {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
  },
}).length

// "node_modules/@scope/pkg/x.js" -> "@scope/pkg"; nested node_modules resolve to the innermost package
function packageOf (inputPath) {
  const marker = 'node_modules/'
  const i = inputPath.lastIndexOf(marker)
  if (i === -1) return '(entry file + shared data)'
  const parts = inputPath.slice(i + marker.length).split('/')
  return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
}

const results = variants.map((v) => {
  const file = path.join(outDir, `${v.id}.js`)
  const buf = fs.readFileSync(file)
  const meta = JSON.parse(fs.readFileSync(path.join(outDir, `${v.id}.meta.json`), 'utf8'))
  const output = meta.outputs[file] ?? Object.values(meta.outputs).find((o) => o.entryPoint)
  // Isolation guard: everything must come from the entry's own libs/<library>/ install (or libs/shared)
  const libDir = `${path.dirname(v.entry)}/`
  const foreign = Object.keys(output.inputs).filter((p) => !p.startsWith(libDir) && !p.startsWith('libs/shared/'))
  if (foreign.length) throw new Error(`${v.id}: inputs resolved outside ${libDir}: ${foreign.join(', ')}`)
  const inputs = Object.entries(output.inputs).map(([p, { bytesInOutput }]) => ({ path: p, bytes: bytesInOutput })).filter((i) => i.bytes > 0)
  const byPackage = {}
  for (const i of inputs) byPackage[packageOf(i.path)] = (byPackage[packageOf(i.path)] ?? 0) + i.bytes
  const cssFile = path.join(outDir, `${v.id}.css`)
  return {
    ...v,
    min: buf.length,
    gzip: gzipSize(file),
    brotli: brotliSize(buf),
    css: fs.existsSync(cssFile) ? fs.statSync(cssFile).size : 0,
    externals: [...new Set(output.imports.filter((i) => i.external).map((i) => i.path))].sort(),
    moduleCount: inputs.length,
    packages: Object.entries(byPackage).map(([name, bytes]) => ({ name, bytes })).sort((a, b) => b.bytes - a.bytes),
    files: inputs.sort((a, b) => b.bytes - a.bytes),
  }
})

const lines = []
const sizeTable = (rows) => {
  lines.push('| id | library | variant | min (KB) | gzip (KB) | brotli (KB) | min (bytes) | gzip (bytes) | brotli (bytes) | CSS file | externals |')
  lines.push('|---|---|---|---:|---:|---:|---:|---:|---:|---|---|')
  for (const r of rows) {
    lines.push(`| ${r.id} | ${r.library} | ${r.variant} | ${kb(r.min)} | ${kb(r.gzip)} | ${kb(r.brotli)} | ${r.min} | ${r.gzip} | ${r.brotli} | ${r.css ? `${r.css} B` : 'none'} | ${r.externals.join(', ') || '-'} |`)
  }
  lines.push('')
}

for (const group of [...new Set(results.map((r) => r.group))]) {
  lines.push(`## ${group}`, '')
  sizeTable(results.filter((r) => r.group === group).sort((a, b) => a.gzip - b.gzip))
}

lines.push('## Top contributors (esbuild metafile, bytesInOutput of the minified bundle)', '')
for (const r of results) {
  lines.push(`### ${r.id} (${r.library}, ${r.variant}) - ${r.moduleCount} modules`, '')
  lines.push('Top 5 packages: ' + r.packages.slice(0, 5).map((p) => `${p.name} ${kb(p.bytes)} KB`).join(' · '), '')
  lines.push('Top 5 files: ' + r.files.slice(0, 5).map((f) => `\`${f.path.replace(/^.*node_modules\//, '')}\` ${kb(f.bytes)} KB`).join(' · '), '')
  lines.push('All packages: ' + r.packages.map((p) => `${p.name} (${kb(p.bytes)})`).join(', '), '')
}

fs.writeFileSync(path.join(outDir, 'report.md'), lines.join('\n'))
fs.writeFileSync(path.join(outDir, 'sizes.json'), JSON.stringify(results.map(({ files, ...r }) => r), null, 2))
console.log(lines.join('\n'))
