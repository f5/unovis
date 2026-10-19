import { test, expect, Page } from '@playwright/test'
import { CAPTURE_DEFAULTS } from '../../src/capture/constants'

async function expectSamePixels (page: Page, before: Buffer, after: Buffer): Promise<void> {
  const changed = await page.evaluate(async images => {
    const pixels = await Promise.all(images.map(async source => {
      const image = new Image()
      image.src = `data:image/png;base64,${source}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d') as CanvasRenderingContext2D
      context.drawImage(image, 0, 0)
      return context.getImageData(0, 0, canvas.width, canvas.height).data
    }))
    let count = 0
    for (let i = 0; i < pixels[0].length; i += 4) {
      if (pixels[0].slice(i, i + 4).some((value, j) => value !== pixels[1][i + j])) count++
    }
    return count
  }, [before.toString('base64'), after.toString('base64')])
  // Chromium can rasterize an edge pixel differently even with identical SVG geometry.
  expect(changed).toBeLessThanOrEqual(1)
}

test('capture is repeatable and independent of gallery preferences', async ({ page }) => {
  await page.goto('/examples/Grouped%20Bar/Basic%20Grouped%20Bar%20Chart?capture=1')
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(frame).toHaveCSS('width', `${CAPTURE_DEFAULTS.width}px`)
  await expect(frame).toHaveCSS('height', `${CAPTURE_DEFAULTS.height}px`)
  await expect(page.locator('.navSideBar')).toHaveCount(0)
  await expect(page.locator('.themeSelector')).toHaveCount(0)
  const before = await frame.screenshot()

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect((await frame.screenshot()).equals(before)).toBe(true)

  await page.goto('/examples/Grouped%20Bar/Basic%20Grouped%20Bar%20Chart?capture=1&seed=0.73')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect((await frame.screenshot()).equals(before)).toBe(false)
})

test('capture waits for async examples and invalidates readiness after changes', async ({ page }) => {
  await page.goto('/examples/Grouped%20Bar/Basic%20Grouped%20Bar%20Chart?capture=1')
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await frame.locator('> div').evaluate(element => element.setAttribute('aria-busy', 'true'))
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
  await page.waitForTimeout(600)
  await expect(frame).toHaveAttribute('data-capture-ready', 'false')
  await frame.locator('> div').evaluate(element => element.setAttribute('aria-busy', 'false'))
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
})

test('capture honors dimensions and theme and hides code even when requested', async ({ page }) => {
  await page.goto('/examples/Grouped%20Bar/Basic%20Grouped%20Bar%20Chart?capture=1&theme=dark&code=1&width=900&height=600')
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(frame).toHaveCSS('width', '900px')
  await expect(frame).toHaveCSS('height', '600px')
  await expect(page.locator('body')).toHaveClass(/theme-dark/)
  await expect(frame).toHaveCSS('background-color', 'rgb(34, 34, 34)')
  await expect(page.locator('.codeViewer')).toHaveCount(0)
})

for (const path of [
  '/examples/Plotline/Plot%20Line',
  '/examples/Xy%20Labels/Stacked%20Bar%20with%20Labels',
  '/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip',
  '/examples/Topojson/MapFitToPoints',
  '/examples/Plotband/Plotband',
  '/examples/Line/Multi%20Line%20Chart',
  '/examples/Axis/Axis%20with%20Label%20Text%20Fit%20Mode',
  '/examples/Axis/Axis%20with%20Ticks%20Rotation',
  '/examples/Scatter/Points%20with%20stroke',
  '/examples/Timeline/Row%20Icons',
  '/examples/Timeline/Line%20Icons',
  '/examples/Area/Gradient%20Area%20Chart',
  '/examples/Graph/Node%20Labels%20and%20Sub-labels',
  '/examples/Graph/Node%20and%20Link%20Circle%20Labels',
  '/examples/Treemap/Treemap:%20Data%20Update',
]) {
  test(`representative example is stable across reloads: ${path}`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${path}?capture=1&theme=light`)
    const frame = page.getByTestId('example-capture')
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await expect(frame.locator('svg').first()).toBeVisible()
    const before = await frame.screenshot({ path: testInfo.outputPath('first-load.png') })
    await page.waitForTimeout(1000)
    expect((await frame.screenshot()).equals(before), 'The example should remain still after reporting ready').toBe(true)

    await page.reload()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    const after = await frame.screenshot({ path: testInfo.outputPath('reload.png') })
    await expectSamePixels(page, before, after)
    expect(errors).toEqual([])

    if (!path.includes('Topojson')) {
      await page.goto(`${path}?capture=1&theme=light&seed=0.73`)
      await expect(frame).toHaveAttribute('data-capture-ready', 'true')
      expect((await frame.screenshot()).equals(before), 'Changing the seed should change generated data').toBe(false)
    }
  })
}

for (const path of ['/examples/Plotline/Plot%20Line', '/examples/Plotband/Plotband']) {
  test(`changing a plot control preserves all five data series: ${path}`, async ({ page }) => {
    await page.goto(`${path}?capture=1`)
    const frame = page.getByTestId('example-capture')
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    const lines = frame.locator('path[class*="linePath"]')
    await expect(lines).toHaveCount(5)
    const before = await lines.evaluateAll(elements => elements.map(element => element.getAttribute('d')))
    await page.getByLabel('Text:', { exact: true }).fill('Changed label')
    await expect(frame.locator('svg').getByText('Changed label')).toBeVisible()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    expect(await lines.evaluateAll(elements => elements.map(element => element.getAttribute('d')))).toEqual(before)
  })
}

test('graph readiness waits for the async force layout', async ({ page }) => {
  let releaseLayout = (): void => undefined
  const layoutPending = new Promise<void>(resolve => { releaseLayout = resolve })
  await page.route(/\/\d+\.bundle\.js/, async route => {
    await layoutPending
    await route.continue()
  })
  try {
    await page.goto('/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip?capture=1')
    const frame = page.getByTestId('example-capture')
    await expect(frame.locator('[aria-busy="true"]')).toBeAttached()
    await page.waitForTimeout(600)
    await expect(frame).toHaveAttribute('data-capture-ready', 'false')
    await expect(frame.locator('[visGraphNodeE2eTestId]')).toHaveCount(0)
    releaseLayout()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await expect(frame.locator('[visGraphNodeE2eTestId]')).toHaveCount(7)
  } finally {
    releaseLayout()
  }
})

test('capture adapter preserves map refs and graph render callbacks', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/examples/Topojson/MapFitToPoints?capture=1')
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const before = await frame.screenshot()
  await page.getByRole('button', { name: 'Zoom In', exact: true }).click()
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  expect((await frame.screenshot()).equals(before)).toBe(false)

  await page.goto('/examples/Graph/Graph:%20Custom%20Nodes?capture=1')
  await expect(frame.locator('text[class*="swimlane-label-text"]').first()).toBeVisible()
  expect(errors).toEqual([])
})


test('graph flow capture stays still and transition demos start paused', async ({ page }) => {
  await page.goto('/examples/Graph/Graph:%20Link%20Flow%20Speed?capture=1')
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const graph = await frame.screenshot()
  await page.waitForTimeout(1000)
  expect((await frame.screenshot()).equals(graph)).toBe(true)

  await page.goto('/examples/Donut/Donut%20Data%20Transitions?capture=1')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  const donut = await frame.screenshot()
  await page.waitForTimeout(2500)
  expect((await frame.screenshot()).equals(donut)).toBe(true)
})

for (const path of [
  '/examples/Bullet%20Legend/Bullet%20Legend%20with%20Multiple%20Colors',
  '/examples/Heatmap/GitHub%20Contributions%20Heatmap',
]) {
  test(`legend and calendar captures repeat: ${path}`, async ({ page }) => {
    await page.goto(`${path}?capture=1`)
    const frame = page.getByTestId('example-capture')
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    if (path.includes('Bullet')) await expect(frame.getByText('y0', { exact: true })).toBeVisible()
    else await expect(frame.locator('svg').first()).toBeVisible()
    const before = await frame.screenshot()
    await page.reload()
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    expect((await frame.screenshot()).equals(before)).toBe(true)
  })
}


test('playback can be paused through the URL and resumed through the control', async ({ page }) => {
  const path = '/examples/Boxplot/Partial%20Data%20%26%20Updates'
  await page.goto(`${path}?capture=1&paused=1`)
  const frame = page.getByTestId('example-capture')
  await expect(frame).toHaveAttribute('data-capture-ready', 'true')
  await expect(page.getByRole('button', { name: 'Resume updates' })).toBeVisible()
  await page.clock.install()
  await page.clock.fastForward(5000)
  await expect(frame.getByText('Full data', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Resume updates' }).click()
  await page.clock.fastForward(1700)
  await expect(frame.getByText('Even boxes: no whiskers', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Pause updates' }).click()
  await page.clock.fastForward(5000)
  await expect(frame.getByText('Even boxes: no whiskers', { exact: false })).toBeVisible()
  await page.clock.resume()

  await page.goto(`${path}?capture=1&paused=0`)
  await expect(page.getByRole('button', { name: 'Pause updates' })).toBeVisible()
})

for (const path of [
  '/examples/Timeline/Animation%20Tweaking',
  '/examples/Timeline/Timeline%20Arrows',
  '/examples/Graph/Dynamic%20Layout',
  '/examples/Topojson/Point%20Shapes',
]) {
  test(`paused URL holds automatic updates: ${path}`, async ({ page }) => {
    await page.goto(`${path}?capture=1&paused=1`)
    const frame = page.getByTestId('example-capture')
    await expect(frame).toHaveAttribute('data-capture-ready', 'true')
    await expect(page.getByRole('button', { name: 'Resume updates' })).toBeVisible()
    const before = await frame.screenshot()
    await page.clock.install()
    await page.clock.fastForward(10000)
    await expectSamePixels(page, before, await frame.screenshot())
  })
}
