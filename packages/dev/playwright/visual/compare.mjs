/* Compares two capture.mjs output directories pixel by pixel and writes a self-contained
 * report: index.html with before / after / diff side by side for every example that needs
 * attention, summary.json, and summary.md (also printed to stdout, ready for a GitHub job
 * summary). Exits 1 when an example changed beyond the tolerance or stopped capturing.
 *
 * Run: pnpm visual:compare --before <dir> --after <dir> --out <dir>
 *      [--max-diff-ratio 0.0005] [--threshold 0.1]
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

import { MANIFEST_FILE, MAX_DIFF_RATIO, PIXEL_THRESHOLD } from './constants.mjs'

const { values: args } = parseArgs({
  options: {
    before: { type: 'string' },
    after: { type: 'string' },
    out: { type: 'string' },
    'max-diff-ratio': { type: 'string', default: String(MAX_DIFF_RATIO) },
    threshold: { type: 'string', default: String(PIXEL_THRESHOLD) },
  },
})
if (!args.before || !args.after || !args.out) {
  console.error('Usage: compare.mjs --before <dir> --after <dir> --out <dir> [--max-diff-ratio <0..1>] [--threshold <0..1>]')
  process.exit(2)
}

const beforeDir = resolve(args.before)
const afterDir = resolve(args.after)
const outDir = resolve(args.out)
const maxDiffRatio = Number(args['max-diff-ratio'])
const threshold = Number(args.threshold)

const readManifest = (dir) => JSON.parse(readFileSync(join(dir, MANIFEST_FILE), 'utf8'))
const before = readManifest(beforeDir)
const after = readManifest(afterDir)
const beforeBySlug = new Map(before.examples.map(example => [example.slug, example]))
const afterBySlug = new Map(after.examples.map(example => [example.slug, example]))

for (const sub of ['before', 'after', 'diff']) mkdirSync(join(outDir, sub), { recursive: true })

const copyImage = (sourceDir, example, sub) => {
  const target = `${sub}/${example.image}`
  copyFileSync(join(sourceDir, example.image), join(outDir, target))
  return target
}

/** Pixel-compare two captures of the same example; returns the entry's verdict fields */
function compareImages (beforeExample, afterExample) {
  const expected = PNG.sync.read(readFileSync(join(beforeDir, beforeExample.image)))
  const actual = PNG.sync.read(readFileSync(join(afterDir, afterExample.image)))
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return { status: 'changed', message: `Size changed ${expected.width}×${expected.height} → ${actual.width}×${actual.height}`, diffRatio: 1 }
  }
  const diff = new PNG({ width: actual.width, height: actual.height })
  const differing = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, { threshold })
  const diffRatio = differing / (actual.width * actual.height)
  if (diffRatio <= maxDiffRatio) return { status: 'unchanged', message: '', diffRatio }
  writeFileSync(join(outDir, 'diff', afterExample.image), PNG.sync.write(diff))
  return { status: 'changed', message: `${(diffRatio * 100).toFixed(3)}% of pixels differ`, diffRatio, diffImage: `diff/${afterExample.image}` }
}

const entries = []
for (const slug of new Set([...beforeBySlug.keys(), ...afterBySlug.keys()].sort())) {
  const b = beforeBySlug.get(slug)
  const a = afterBySlug.get(slug)
  const example = a ?? b
  const entry = { slug, category: example.category, title: example.title, route: example.route, status: '', message: '' }
  if (!a) {
    Object.assign(entry, { status: 'removed', message: 'No longer in the examples', beforeImage: b.image && copyImage(beforeDir, b, 'before') })
  } else if (!b) {
    Object.assign(entry, { status: 'added', message: 'New example', afterImage: a.image && copyImage(afterDir, a, 'after') })
  } else if (a.status !== 'ok') {
    const alsoBefore = b.status !== 'ok'
    Object.assign(entry, {
      status: alsoBefore ? 'failing' : 'failed',
      message: `${a.status}: ${a.message}${alsoBefore ? ' (also failed before)' : ''}`,
      beforeImage: b.image && copyImage(beforeDir, b, 'before'),
    })
  } else if (b.status !== 'ok') {
    Object.assign(entry, { status: 'recovered', message: `Captures again (before: ${b.status}: ${b.message})`, afterImage: copyImage(afterDir, a, 'after') })
  } else {
    Object.assign(entry, compareImages(b, a))
    if (entry.status === 'changed') {
      entry.beforeImage = copyImage(beforeDir, b, 'before')
      entry.afterImage = copyImage(afterDir, a, 'after')
    }
  }
  entries.push(entry)
}

const byStatus = (status) => entries.filter(entry => entry.status === status)
const counts = Object.fromEntries(['changed', 'failed', 'recovered', 'added', 'removed', 'failing', 'unchanged'].map(status => [status, byStatus(status).length]))
const attention = entries.filter(entry => entry.status !== 'unchanged')
const needsReview = counts.changed + counts.failed > 0

const summary = { createdAt: new Date().toISOString(), maxDiffRatio, threshold, before: before.createdAt, after: after.createdAt, counts, entries }
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2))

// ── Markdown summary (stdout + summary.md) ───────────────────────────────────
const label = { changed: 'Changed', failed: 'Stopped capturing', recovered: 'Captures again', added: 'Added', removed: 'Removed', failing: 'Not captured (before and after)' }
const md = [`## Visual comparison: ${needsReview ? `${counts.changed} changed, ${counts.failed} stopped capturing` : 'no visual changes'}`, '']
md.push([
  `${counts.unchanged} unchanged`, `${counts.changed} changed`, `${counts.failed} stopped capturing`, `${counts.recovered} recovered`,
  `${counts.added} added`, `${counts.removed} removed`, `${counts.failing} not captured on either side`,
].join(' · '), '')
for (const status of Object.keys(label)) {
  const group = byStatus(status)
  if (!group.length) continue
  md.push(`### ${label[status]} (${group.length})`, '')
  for (const entry of group) md.push(`- **${entry.category} / ${entry.title}**${entry.message ? ` — ${entry.message}` : ''}`)
  md.push('')
}
if (attention.length) md.push('Open `index.html` in the report artifact for before / after / diff images.', '')
writeFileSync(join(outDir, 'summary.md'), md.join('\n'))
process.stdout.write(`${md.join('\n')}\n`)

// ── HTML report ──────────────────────────────────────────────────────────────
const escape = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const image = (src, caption) => src
  ? `<figure><a href="${escape(src)}" target="_blank"><img src="${escape(src)}" loading="lazy" alt="${escape(caption)}"></a>` +
    `<figcaption>${escape(caption)}</figcaption></figure>`
  : `<figure class="empty"><div>no image</div><figcaption>${escape(caption)}</figcaption></figure>`
const card = (entry) => `
<section class="card ${entry.status}">
  <h2><span class="status">${escape(label[entry.status])}</span> ${escape(entry.category)} / ${escape(entry.title)}</h2>
  ${entry.message ? `<p>${escape(entry.message)}</p>` : ''}
  <div class="images">
    ${image(entry.beforeImage, 'before')}
    ${image(entry.afterImage, 'after')}
    ${entry.status === 'changed' ? image(entry.diffImage, 'diff') : ''}
  </div>
  <p class="route"><code>${escape(entry.route)}?capture=1</code></p>
</section>`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Visual comparison</title>
<style>
  :root { color-scheme: light dark; font: 14px/1.4 system-ui, sans-serif; }
  body { margin: 0; padding: 24px; max-width: 1800px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .counts { color: GrayText; margin: 0 0 24px; }
  .card { border: 1px solid color-mix(in srgb, CanvasText 15%, transparent); border-radius: 8px; padding: 16px; margin: 0 0 16px; }
  .card h2 { font-size: 15px; margin: 0 0 8px; }
  .status { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; padding: 2px 6px; border-radius: 4px; margin-right: 6px; }
  .status { background: color-mix(in srgb, CanvasText 10%, transparent); }
  .changed .status, .failed .status { background: #d33; color: #fff; }
  .recovered .status, .added .status { background: #2a8; color: #fff; }
  .images { display: flex; gap: 12px; }
  figure { margin: 0; flex: 1 1 0; min-width: 0; }
  figure img { width: 100%; height: auto; border: 1px solid color-mix(in srgb, CanvasText 15%, transparent); background: #fff; }
  figure.empty div { aspect-ratio: 3 / 2; display: grid; place-items: center; color: GrayText; border: 1px dashed color-mix(in srgb, CanvasText 25%, transparent); }
  figcaption { font-size: 12px; color: GrayText; margin-top: 4px; }
  .route { margin: 8px 0 0; font-size: 12px; }
  details { margin-top: 24px; }
  details li { font-size: 13px; }
</style>
</head>
<body>
<h1>Visual comparison</h1>
<p class="counts">${escape(md[2])}</p>
${attention.length ? attention.map(card).join('\n') : '<p>No example needs attention.</p>'}
<details>
  <summary>${counts.unchanged} unchanged examples</summary>
  <ul>${byStatus('unchanged').map(entry => `<li>${escape(entry.category)} / ${escape(entry.title)}${entry.diffRatio ? ` (${(entry.diffRatio * 100).toFixed(3)}%)` : ''}</li>`).join('')}</ul>
</details>
</body>
</html>
`
writeFileSync(join(outDir, 'index.html'), html)

process.exit(needsReview ? 1 : 0)
