import { test, expect } from '@playwright/test'

import { PLOTLINE_EXAMPLE_PATH, XY_LABELS_EXAMPLE_PATH } from './constants'

test('switching examples clears config while preserving gallery preferences and history', async ({ page }) => {
  const config = { plotline: { value: 7 }, example: { labelFontSize: 30 } }
  const query = new URLSearchParams({ code: '0', q: 'plot', paused: '1', theme: 'light', seed: '0.73', config: JSON.stringify(config) })
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?${query}`)
  const active = page.locator('nav a[href*="/Plotline/Plot%20Line?"]')
  await active.click()
  expect(JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')).toEqual(config)
  const next = page.locator('nav a[href*="/Plotline/Plotline%20Label%20Bleed?"]')
  await next.click()
  const params = new URL(page.url()).searchParams
  expect(params.has('config')).toBe(false)
  expect(Object.fromEntries(params)).toEqual({ code: '0', q: 'plot', paused: '1', theme: 'light', seed: '0.73' })
  await page.goBack()
  await expect(page.getByLabel('Value (7):', { exact: true })).toHaveValue('7')
  expect(JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')).toEqual(config)
})

test('plot line controls survive copied links, reloads, and browser back', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1&seed=0.73&width=1000&paused=1&code=1&q=line`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const lines = frame.locator('path[class*="linePath"]')
  const initial = await lines.evaluateAll(elements => elements.map(element => element.getAttribute('d')))

  await page.getByLabel('Text:', { exact: true }).fill('Shared label & 日本語')
  await page.getByLabel(/^Axis:/).selectOption('1')
  await page.getByLabel('Style:', { exact: false }).selectOption('6')
  await page.getByLabel(/^Position:/).selectOption('top')
  await page.getByLabel('Value (3):', { exact: true }).press('ArrowRight')
  await page.getByRole('button', { name: 'Copy link', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Copied link', exact: true })).toBeVisible()
  const shared = await page.evaluate(() => navigator.clipboard.readText())
  expect(shared).toBe(page.url())
  expect(JSON.parse(new URL(shared).searchParams.get('config') ?? '{}').plotline).toMatchObject({
    labelText: 'Shared label & 日本語', axis: 'y', lineStyle: 'dash', labelPosition: 'top', value: 3.5,
  })

  await page.goto(shared)
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(page.getByLabel('Text:', { exact: true })).toHaveValue('Shared label & 日本語')
  await expect(page.getByLabel(/^Axis:/)).toHaveValue('1')
  await expect(page.getByLabel('Style:', { exact: false })).toHaveValue('6')
  await page.reload()
  await expect(page.getByLabel(/^Position:/)).toHaveValue('top')

  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByLabel('Text:', { exact: true })).toHaveValue('x label')
  await expect(page.getByLabel(/^Axis:/)).toHaveValue('0')
  await expect(page.getByLabel('Style:', { exact: false })).toHaveValue('0')
  await expect(page.getByLabel(/^Position:/)).toHaveValue('left')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect(await lines.evaluateAll(elements => elements.map(element => element.getAttribute('d')))).toEqual(initial)
  const resetParams = new URL(page.url()).searchParams
  expect(resetParams.has('config')).toBe(false)
  expect(Object.fromEntries(resetParams)).toEqual({ capture: '1', seed: '0.73', width: '1000', paused: '1', code: '1', q: 'line' })

  await page.goto(shared)
  await page.goto(`${XY_LABELS_EXAMPLE_PATH}?capture=1`)
  await page.goBack()
  await expect(page.getByLabel('Text:', { exact: true })).toHaveValue('Shared label & 日本語')
})

test('cleared plot line values are shared and reset restores their defaults', async ({ page }) => {
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1`)
  await page.getByRole('button', { name: 'Clear', exact: true }).nth(0).click()
  await page.getByRole('button', { name: 'Clear', exact: true }).nth(1).click()
  const params = new URL(page.url()).searchParams
  expect(JSON.parse(params.get('config') ?? '{}').plotline).toEqual({ lineStyle: null, color: null })
  await page.reload()
  await expect(page.getByLabel('Style:', { exact: false })).toHaveValue('')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByLabel('Style:', { exact: false })).toHaveValue('0')
  await expect(page.locator('input[type="color"]').first()).toHaveValue('#ff8400')
})

test('XY labels controls restore from the URL and reset without replacing data', async ({ page }) => {
  await page.goto(`${XY_LABELS_EXAMPLE_PATH}?capture=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const bars = frame.locator('path[class*="bar"]')
  await expect(bars.first()).toBeVisible()
  const before = await bars.evaluateAll(elements => elements.map(element => element.getAttribute('d')))
  const labels = frame.locator('svg text').filter({ hasText: /\d+\.\d bps/ })
  await expect(labels).not.toHaveCount(0)
  await page.getByLabel('Data labels', { exact: true }).uncheck()
  await page.getByLabel('Clustering', { exact: true }).uncheck()
  await page.getByLabel('Label font size:', { exact: false }).press('ArrowRight')
  await expect(labels).toHaveCount(0)
  const shared = page.url()
  expect(JSON.parse(new URL(shared).searchParams.get('config') ?? '{}').xyLabels).toEqual({ showLabels: false, clustering: false, labelFontSize: 13 })
  await page.reload()
  await expect(page.getByLabel('Data labels', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Clustering', { exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Label font size:', { exact: false })).toHaveValue('13')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByLabel('Data labels', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Clustering', { exact: true })).toBeChecked()
  await expect(page.getByLabel('Label font size:', { exact: false })).toHaveValue('12')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect(await bars.evaluateAll(elements => elements.map(element => element.getAttribute('d')))).toEqual(before)
  expect(new URL(page.url()).searchParams.has('config')).toBe(false)
})

test('malformed component config fall back to defaults', async ({ page }) => {
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1&config=broken`)
  await expect(page.getByLabel('Text:', { exact: true })).toHaveValue('x label')
  await expect(page.getByLabel('Value (3):', { exact: true })).toHaveValue('3')
  await expect(page.getByLabel(/^Position:/)).toHaveValue('left')
  await page.goto(`${XY_LABELS_EXAMPLE_PATH}?capture=1&config=broken`)
  await expect(page.getByLabel('Data labels', { exact: true })).toBeChecked()
})

test('arbitrary plot line config supports arrays, rich text, and capture duration priority', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const input = {
    plotline: {
      axis: 'y',
      value: 4.7,
      lineWidth: 9.25,
      lineStyle: [3, 7],
      labelText: { text: 'Rich threshold', color: '#123456' },
      duration: 10000,
      onRenderComplete: 'not a callback',
      ref: 'not a ref',
      data: [],
    },
    graph: { nodeSize: 40 },
  }
  await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=1&config=${encodeURIComponent(JSON.stringify(input))}`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(page.getByLabel(/^Axis:/)).toHaveValue('1')
  await expect(page.getByLabel('Value (4.7):', { exact: true })).toHaveValue('4.7')
  await expect(page.getByLabel('Width (9.25):', { exact: true })).toHaveValue('9.25')
  await expect(page.getByLabel('Style:', { exact: false })).toHaveValue('custom')
  await expect(page.getByLabel('Text:', { exact: true })).toHaveValue(JSON.stringify(input.plotline.labelText))
  const line = frame.locator('line[class*="plotline"]')
  await expect(line).toHaveCSS('stroke-width', '9.25px')
  await expect(line).toHaveCSS('stroke-dasharray', '3px, 7px')
  await expect(frame.locator('svg').getByText('Rich threshold', { exact: true })).toBeVisible()
  const duration = await frame.locator('vis-component').last().evaluate(element => {
    return (element as HTMLElement & Record<'__component__', { config: { duration: number } }>).__component__.config.duration
  })
  expect(duration).toBe(0)
  await page.getByLabel('Width (9.25):', { exact: true }).press('ArrowLeft')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  expect(JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')).toEqual({ graph: { nodeSize: 40 } })
  expect(errors).toEqual([])
})

for (const capture of [false, true]) {
  test(`component overrides apply to every line independently of plotline (capture=${capture})`, async ({ page }) => {
    const input = { line: { lineWidth: 7, duration: 123 }, plotline: { lineWidth: 4 } }
    await page.goto(`${PLOTLINE_EXAMPLE_PATH}?capture=${Number(capture)}&config=${encodeURIComponent(JSON.stringify(input))}`)
    const lines = page.locator('path[class*="linePath"]')
    await expect(lines).toHaveCount(5)
    for (const line of await lines.all()) await expect(line).toHaveCSS('stroke-width', '7px')
    await expect(page.locator('line[class*="plotline"]')).toHaveCSS('stroke-width', '4px')
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    expect(JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')).toEqual({ line: input.line })
    for (const line of await lines.all()) await expect(line).toHaveCSS('stroke-width', '7px')
  })
}

test('graph and map query config preserve capture overrides and readiness', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const input = {
    graph: { nodeSize: 47, duration: 500, linkFlow: true },
    topoJSONMap: { pointRadius: 13, duration: 500, zoomDuration: 500, enableFlowAnimation: true },
  }
  const query = `?capture=1&config=${encodeURIComponent(JSON.stringify(input))}`
  const frame = page.getByTestId('example-capture')
  await page.goto(`/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip${query}`)
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const graph = await frame.locator('vis-component').first().evaluate(element => {
    const { nodeSize, duration, linkFlow } = (element as HTMLElement & Record<'__component__', { config: Record<string, unknown> }>).__component__.config
    return { nodeSize, duration, linkFlow }
  })
  expect(graph).toEqual({ nodeSize: 47, duration: 0, linkFlow: false })
  await page.goto(`/examples/Topojson/MapFitToPoints${query}`)
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const map = await frame.locator('vis-component').first().evaluate(element => {
    const { pointRadius, duration, zoomDuration, enableFlowAnimation } = (element as HTMLElement & Record<'__component__', { config: Record<string, unknown> }>).__component__.config
    return { pointRadius, duration, zoomDuration, enableFlowAnimation }
  })
  expect(map).toEqual({ pointRadius: 13, duration: 0, zoomDuration: 0, enableFlowAnimation: false })
  await page.getByRole('button', { name: 'Zoom In', exact: true }).click()
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect(errors).toEqual([])
})

test('HTML legend components accept query config', async ({ page }) => {
  const config = encodeURIComponent(JSON.stringify({ bulletLegend: { labelFontSize: '24px' } }))
  await page.goto(`/examples/Bullet%20Legend/Bullet%20Legend%20with%20Multiple%20Colors?capture=1&config=${config}`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(frame.getByText('y0', { exact: true })).toHaveCSS('font-size', '24px')
})

for (const capture of [false, true]) {
  test(`XY labels controls reflect query config and preserve other components (capture=${capture})`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const input = { xyLabels: { clustering: false, labelFontSize: 28.5 }, stackedBar: { opacity: 0.6 } }
    await page.goto(`${XY_LABELS_EXAMPLE_PATH}?capture=${Number(capture)}&seed=0.73&config=${encodeURIComponent(JSON.stringify(input))}`)
    await expect(page.getByLabel('Clustering', { exact: true })).not.toBeChecked()
    const fontSize = page.getByLabel('Label font size:', { exact: false })
    await expect(fontSize).toHaveValue('28.5')
    const labels = page.locator('svg text').filter({ hasText: /\d+\.\d bps/ })
    await expect(labels.first()).toHaveCSS('font-size', '28.5px')
    await fontSize.press('Home')
    await expect(labels.first()).toHaveCSS('font-size', '8px')
    await page.getByRole('button', { name: 'Copy link', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Copied link', exact: true })).toBeVisible()
    const shared = await page.evaluate(() => navigator.clipboard.readText())
    expect(shared).toBe(page.url())
    expect(JSON.parse(new URL(shared).searchParams.get('config') ?? '{}')).toEqual({
      xyLabels: { clustering: false, labelFontSize: 8 }, stackedBar: input.stackedBar,
    })
    await page.goto(shared)
    await expect(fontSize).toHaveValue('8')
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(fontSize).toHaveValue('12')
    await expect(page.getByLabel('Clustering', { exact: true })).toBeChecked()
    expect(JSON.parse(new URL(page.url()).searchParams.get('config') ?? '{}')).toEqual({ stackedBar: input.stackedBar })
    expect(new URL(page.url()).searchParams.get('seed')).toBe('0.73')
  })
}
