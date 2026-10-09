// Optional cross-check of the tree-shaking step: bundles the same entry files with Rollup instead of
// esbuild (same externals, same NODE_ENV), minifies Rollup's output with the same esbuild minifier and
// target, measures it the same way, and compares with the esbuild numbers from <dist>/sizes.json.
// Usage (after ./measure.sh):  cd crosscheck && npm ci && node rollup.mjs [dist]
// Output: dist-rollup/<id>.js, dist-rollup/variants.tsv (so verify/verify.mjs dist-rollup works), dist-rollup/report.md
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { rollup, VERSION } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import * as esbuild from 'esbuild'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const esbuildDir = path.join(root, process.argv[2] ?? 'dist')
const outDir = path.join(root, 'dist-rollup')
const TARGET = process.env.TARGET ?? 'es2020'
fs.mkdirSync(outDir, { recursive: true })

const variantsTsv = fs.readFileSync(path.join(esbuildDir, 'variants.tsv'), 'utf8')
const variants = variantsTsv.trim().split('\n').map((line) => {
  const [id, group, library, variant, entry] = line.split('\t')
  return { id, group, library, variant, entry }
})
const esbuildSizes = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(esbuildDir, 'sizes.json'), 'utf8')).map((r) => [r.id, r]))

const kb = (bytes) => (bytes / 1024).toFixed(1)
const gzipSize = (file) => Number(execFileSync('sh', ['-c', 'gzip -9 -c "$1" | wc -c', 'sh', file], { encoding: 'utf8' }).trim())
const brotliSize = (buf) => zlib.brotliCompressSync(buf, {
  params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length },
}).length
const IGNORED_WARNINGS = new Set(['CIRCULAR_DEPENDENCY', 'THIS_IS_UNDEFINED', 'MODULE_LEVEL_DIRECTIVE', 'EVAL', 'SOURCEMAP_ERROR'])

const rows = []
for (const v of variants) {
  // Same externals as the esbuild build of this variant (React rows: react, react-dom, react/jsx-runtime)
  const reactExternal = esbuildSizes[v.id].externals.length > 0
  const bundle = await rollup({
    input: path.join(root, v.entry),
    external: reactExternal ? (id) => /^(react|react-dom)(\/.*)?$/.test(id) : [],
    jsx: v.entry.endsWith('.jsx') ? 'react-jsx' : false,
    plugins: [
      replace({ preventAssignment: true, values: { 'process.env.NODE_ENV': JSON.stringify('production') } }),
      nodeResolve({ browser: true, exportConditions: ['browser'], extensions: ['.mjs', '.js', '.jsx', '.json'] }),
      commonjs(),
    ],
    onwarn (warning, warn) {
      if (!IGNORED_WARNINGS.has(warning.code)) warn(warning)
    },
  })
  const { output } = await bundle.generate({ format: 'es' })
  await bundle.close()
  const code = output.filter((o) => o.type === 'chunk').map((o) => o.code).join('\n')
  if (output.filter((o) => o.type === 'chunk').length !== 1) console.warn(`${v.id}: ${output.length} chunks`)
  const { code: minified } = await esbuild.transform(code, { minify: true, format: 'esm', target: TARGET })
  const file = path.join(outDir, `${v.id}.js`)
  fs.writeFileSync(file, minified)
  const buf = fs.readFileSync(file)
  const r = { ...v, min: buf.length, gzip: gzipSize(file), brotli: brotliSize(buf), esbuild: esbuildSizes[v.id] }
  rows.push(r)
  console.log(`${v.id.padEnd(18)} rollup+esbuild-minify: ${kb(r.min).padStart(7)} KB min, ${kb(r.gzip).padStart(6)} KB gzip | esbuild: ${kb(r.esbuild.min).padStart(7)} KB min, ${kb(r.esbuild.gzip).padStart(6)} KB gzip`)
}

fs.writeFileSync(path.join(outDir, 'variants.tsv'), variantsTsv)
const lines = [
  `Rollup ${VERSION} (tree-shaking, default options) + esbuild ${esbuild.version} minify (target ${TARGET}) vs esbuild-only bundles. KB = 1024 bytes.`,
  '',
  '| id | library | variant | esbuild min (KB) | esbuild gzip (KB) | Rollup min (KB) | Rollup gzip (KB) | Rollup brotli (KB) | Rollup min (bytes) | Rollup gzip (bytes) |',
  '|---|---|---|---:|---:|---:|---:|---:|---:|---:|',
  ...rows.map((r) => `| ${r.id} | ${r.library} | ${r.variant} | ${kb(r.esbuild.min)} | ${kb(r.esbuild.gzip)} | ${kb(r.min)} | ${kb(r.gzip)} | ${kb(r.brotli)} | ${r.min} | ${r.gzip} |`),
  '',
]
fs.writeFileSync(path.join(outDir, 'report.md'), lines.join('\n'))
