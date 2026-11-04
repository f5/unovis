/** The visual comparison lane (playwright/visual): the example list must match the sources,
 * and compare.mjs must report a changed capture with a diff image and a report. The capture
 * itself runs through the app's capture mode, covered by capture-mode.spec.ts. */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { test, expect } from '@playwright/test'
import { PNG } from 'pngjs'

const devRoot = resolve(__dirname, '..', '..')
const visualDir = join(devRoot, 'playwright', 'visual')

const countIndexFiles = (dir: string): number => readdirSync(dir, { withFileTypes: true })
  .reduce((count, entry) => count + (entry.isDirectory() ? countIndexFiles(join(dir, entry.name)) : Number(entry.name === 'index.tsx')), 0)

const solidPng = (rgb: [number, number, number]): Buffer => {
  const image = new PNG({ width: 20, height: 10 })
  for (let i = 0; i < image.data.length; i += 4) image.data.set([...rgb, 255], i)
  return PNG.sync.write(image)
}

type CompareRun = { status: number; stdout: string }
const runCompare = (before: string, after: string, out: string): CompareRun => {
  try {
    return { status: 0, stdout: execFileSync(process.execPath, [join(visualDir, 'compare.mjs'), '--before', before, '--after', after, '--out', out], { encoding: 'utf8' }) }
  } catch (error) {
    const failure = error as { status: number; stdout: string }
    return { status: failure.status, stdout: failure.stdout }
  }
}

test('lists every example with the route the app registers', async () => {
  const { listExamples } = await import('../visual/examples.mjs')
  const examples = listExamples()
  expect(examples.length).toBe(countIndexFiles(join(devRoot, 'src', 'examples')))
  expect(new Set(examples.map(example => example.route)).size).toBe(examples.length)
  expect(examples.find(example => example.file === 'xy-components/line/multi-line-chart/index.tsx')?.route).toBe('/examples/Line/Multi%20Line%20Chart')
  expect(examples.find(example => example.file === 'misc/donut/index.tsx')?.title).toBe('Donut Data Transitions')
})

test('compare reports a changed capture with a diff image and exits 1', async ({ page }, testInfo) => {
  const dir = testInfo.outputPath('compare')
  const example = (slug: string, title: string): Record<string, string> =>
    ({ slug, category: 'Lane', title, route: `/examples/Lane/${title}`, status: 'ok', message: '', image: `${slug}.png` })
  const examples = [example('lane--same', 'Same'), example('lane--changed', 'Changed')]
  const runs: Array<[string, [number, number, number]]> = [['before', [200, 40, 40]], ['after', [40, 40, 200]]]
  for (const [name, changedColor] of runs) {
    mkdirSync(join(dir, name), { recursive: true })
    writeFileSync(join(dir, name, 'lane--same.png'), solidPng([255, 255, 255]))
    writeFileSync(join(dir, name, 'lane--changed.png'), solidPng(changedColor))
    writeFileSync(join(dir, name, 'manifest.json'), JSON.stringify({ examples }))
  }

  const identical = runCompare(join(dir, 'before'), join(dir, 'before'), join(dir, 'report-identical'))
  expect(identical.status).toBe(0)
  expect(identical.stdout).toContain('no visual changes')

  const changed = runCompare(join(dir, 'before'), join(dir, 'after'), join(dir, 'report'))
  expect(changed.status).toBe(1)
  expect(changed.stdout).toContain('1 changed')
  const summary = JSON.parse(readFileSync(join(dir, 'report', 'summary.json'), 'utf8'))
  expect(summary.counts).toMatchObject({ changed: 1, unchanged: 1 })
  expect(existsSync(join(dir, 'report', 'diff', 'lane--changed.png'))).toBe(true)

  await page.goto(`file://${join(dir, 'report', 'index.html')}`)
  await expect(page.getByRole('heading', { name: 'Lane / Changed' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'diff' })).toBeVisible()
  await expect(page.getByText('Lane / Same')).toBeHidden()
})
