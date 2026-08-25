/* Real-browser smoke lane.
 *
 * jsdom executes the widget bundle but performs no layout, paint or real
 * event dispatch — a broken crosshair once passed every jsdom test and was
 * caught only by a human with a browser. This lane runs the generated
 * documents in headless Chromium: every chart family renders with a clean
 * console, and the interactions jsdom can't exercise (hover → tooltip,
 * click → event, theme flip) are driven with real input.
 *
 * Run: pnpm test:browser (requires `pnpm build` and a Playwright chromium:
 * `pnpm exec playwright install chromium`)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { z } from 'zod'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { buildChartDocument, buildEmbedDocument, recipeByName } = await import(join(root, 'dist', 'index.js'))

/** Minimal but real inputs, one per tool */
const INPUTS = {
  generate_line_chart: { data: [{ t: '2026-08-01', a: 3, b: 5 }, { t: '2026-08-05', a: 6, b: 2 }, { t: '2026-08-09', a: 4, b: 7 }], x: 't', xIsTime: true, y: ['a', 'b'], seriesLabels: ['Alpha', 'Beta'], title: 'Lines' },
  generate_area_chart: { data: [{ t: 1, a: 3, b: 5 }, { t: 2, a: 6, b: 2 }, { t: 3, a: 4, b: 7 }], x: 't', y: ['a', 'b'], title: 'Areas' },
  generate_bar_chart: { data: [{ cat: 'A', v: 3, w: 2 }, { cat: 'B', v: 6, w: 4 }], x: 'cat', y: ['v', 'w'], title: 'Bars' },
  generate_scatter_plot: { data: [{ x: 1, y: 2, s: 10 }, { x: 2, y: 5, s: 30 }], x: 'x', y: 'y', size: 's', title: 'Scatter' },
  generate_donut_chart: { data: [{ k: 'A', v: 4 }, { k: 'B', v: 6 }], value: 'v', label: 'k', title: 'Donut' },
  generate_timeline_chart: { data: [{ row: 'T1', start: '2026-01-01', end: '2026-02-01' }, { row: 'T2', start: '2026-01-15', end: '2026-03-01' }], row: 'row', start: 'start', end: 'end', timeIsDate: true, title: 'Timeline' },
  generate_boxplot: { data: [{ g: 'A', v: 1 }, { g: 'A', v: 3 }, { g: 'A', v: 5 }, { g: 'B', v: 2 }, { g: 'B', v: 6 }, { g: 'B', v: 9 }], groupBy: 'g', value: 'v', title: 'Boxplot' },
  generate_sankey_diagram: { nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], links: [{ source: 'a', target: 'b', value: 3 }, { source: 'a', target: 'c', value: 2 }], title: 'Sankey' },
  generate_heatmap: { data: [{ r: 'x', c: 'p', v: 1 }, { r: 'x', c: 'q', v: 4 }, { r: 'y', c: 'p', v: 2 }, { r: 'y', c: 'q', v: 8 }], row: 'r', column: 'c', value: 'v', title: 'Heatmap' },
  generate_treemap: { data: [{ g: 'A', k: 'a1', v: 5 }, { g: 'A', k: 'a2', v: 3 }, { g: 'B', k: 'b1', v: 7 }], value: 'v', layers: ['g', 'k'], title: 'Treemap' },
  generate_chord_diagram: { links: [{ source: 'a', target: 'b', value: 3 }, { source: 'b', target: 'c', value: 2 }], title: 'Chord' },
  generate_nested_donut_chart: { data: [{ l1: 'A', l2: 'a1', v: 4 }, { l1: 'A', l2: 'a2', v: 2 }, { l1: 'B', l2: 'b1', v: 6 }], layers: ['l1', 'l2'], value: 'v', title: 'Nested donut' },
  generate_radial_bar_chart: { data: [{ k: 'A', v: 4 }, { k: 'B', v: 7 }], value: 'v', label: 'k', title: 'Radial bars' },
  generate_network_graph: { nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], links: [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }], layout: 'dagre', title: 'Graph' },
  generate_choropleth_map: { data: [{ id: 'US', value: 5 }, { id: 'DE', value: 9 }], map: 'world', title: 'Map' },
}

const specFor = (name) => {
  const recipe = recipeByName.get(name)
  if (!recipe) throw new Error(`unknown recipe ${name}`)
  return recipe.toSpec(z.object(recipe.inputShape).parse(INPUTS[name]))
}

const failures = []
const check = (ok, label) => {
  console.error(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures.push(label)
}

const browser = await chromium.launch()
const shotsDir = join(root, 'samples', 'out', 'browser')
mkdirSync(shotsDir, { recursive: true })

/** Load a document and collect console errors + page errors */
async function open (html) {
  const page = await browser.newPage({ viewport: { width: 900, height: 640 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.setContent(html, { waitUntil: 'load' })
  return { page, errors }
}

// ── 1. every chart family renders with a clean console ─────────────────────
for (const name of Object.keys(INPUTS)) {
  const { page, errors } = await open(buildChartDocument(specFor(name), { duration: 0 }))
  const svg = await page.waitForSelector('.uv-chart svg', { timeout: 15000 }).catch(() => null)
  check(svg !== null && errors.length === 0, `${name} renders (errors: ${errors.join('; ') || 'none'})`)
  if (['generate_line_chart', 'generate_donut_chart', 'generate_sankey_diagram'].includes(name)) {
    await page.screenshot({ path: join(shotsDir, `${name}.png`) })
  }
  await page.close()
}

// ── 2. hover produces the crosshair readout (real layout + real mouse) ─────
{
  const { page } = await open(buildChartDocument(specFor('generate_line_chart'), { duration: 0 }))
  await page.waitForSelector('.uv-chart svg')
  const box = await (await page.$('.uv-chart svg')).boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
  const tooltip = await page.waitForSelector('[class*="tooltip"]:visible', { timeout: 5000 }).catch(() => null)
  const text = tooltip ? await tooltip.innerText() : ''
  check(text.includes('Alpha') && text.includes('Beta'), `crosshair readout shows both series (got: ${JSON.stringify(text.slice(0, 60))})`)
  await page.screenshot({ path: join(shotsDir, 'crosshair-hover.png') })
  await page.close()
}

// ── 3. embed protocol end to end: render, click → event, theme flip ────────
{
  const { page, errors } = await open(buildEmbedDocument())
  await page.evaluate(() => {
    window.__events = []
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'unovis:event') window.__events.push(event.data)
    })
  })
  const spec = specFor('generate_bar_chart')
  await page.evaluate((chartSpec) => {
    window.postMessage({ type: 'unovis:render', spec: chartSpec, options: { duration: 0, events: true } }, '*')
  }, spec)
  await page.waitForSelector('#uv-embed-root .uv-chart svg path[class*="bar"]', { timeout: 15000 })
  // user event listeners attach through the core's 500ms-throttled setup pass
  await page.waitForTimeout(700)
  await page.click('#uv-embed-root path[class*="bar"]')
  const events = await page.waitForFunction(() => window.__events.length > 0, undefined, { timeout: 5000 })
    .then(() => page.evaluate(() => window.__events))
    .catch(() => [])
  check(events.length > 0 && /Bar/.test(events[0]?.component ?? ''), `real click reaches the host (got: ${JSON.stringify(events[0] ?? null)})`)

  await page.evaluate(() => window.postMessage({ type: 'unovis:theme', theme: 'dark' }, '*'))
  await page.waitForSelector('html[data-theme="dark"]', { timeout: 5000 }).catch(() => null)
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  check(theme === 'dark', 'unovis:theme re-renders in dark')
  check(errors.length === 0, `embed console stayed clean (errors: ${errors.join('; ') || 'none'})`)
  await page.close()
}

await browser.close()
writeFileSync(join(shotsDir, 'RESULTS.txt'), failures.length ? `FAILURES:\n${failures.join('\n')}\n` : 'all checks passed\n')

if (failures.length) {
  console.error(`\n✗ ${failures.length} browser smoke check(s) failed`)
  process.exit(1)
}
console.error('\n✓ browser smoke lane passed')
