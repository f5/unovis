import { test, expect } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  test(`keeps the first wrapped treemap line inside its clip in ${theme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' })
    await page.goto('/examples/Treemap/Treemap:%20Basic?duration=0')
    const labels = page.locator('.exampleViewer g[class*="label-group"] text:has(tspan)')
    await expect(labels.first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    const firstLines = await labels.evaluateAll(elements => elements.map(element => {
      const span = element.querySelector('tspan') as SVGTSpanElement
      const box = span.getBBox()
      return { text: span.textContent, top: box.y, bottom: box.y + box.height }
    }))
    expect(firstLines.length).toBeGreaterThan(0)
    for (const line of firstLines) {
      expect(line.top, line.text).toBeGreaterThanOrEqual(-0.5)
      expect(line.bottom, line.text).toBeGreaterThan(0)
    }

    const headers = page.locator('.exampleViewer g[class*="label-group"] text:not(:has(tspan))')
    await expect(headers.first()).toBeVisible()
    expect(await headers.first().getAttribute('dy')).toBeNull()
    const headerBounds = await headers.evaluateAll(elements => elements.map(element => {
      const box = (element as SVGTextElement).getBBox()
      return { text: element.textContent, top: box.y }
    }))
    for (const header of headerBounds) {
      expect(header.top, header.text).toBeGreaterThanOrEqual(-0.5)
    }
    const baselines = await page.locator('.exampleViewer g[class*="label-group"] text, .exampleViewer g[class*="label-group"] tspan')
      .evaluateAll(elements => elements.map(element => getComputedStyle(element).dominantBaseline))
    expect(baselines.every(baseline => baseline === 'text-before-edge' || baseline === 'text-top')).toBe(true)
  })
}
