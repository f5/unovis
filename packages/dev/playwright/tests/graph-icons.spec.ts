import { test, expect } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  test(`centers graph icon text in ${theme} mode and respects baseline overrides`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' })
    await page.goto('/examples/Graph/Layout:%20ELK?duration=0')
    const icons = page.locator('.exampleViewer text[dy="0.1em"]')
    await expect(icons.first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    const offsets = await icons.evaluateAll(elements => elements.map(element => {
      const box = (element as SVGTextElement).getBBox()
      return { baseline: getComputedStyle(element).dominantBaseline, offset: Math.abs(box.y + box.height / 2) }
    }))
    expect(offsets.length).toBeGreaterThan(0)
    for (const icon of offsets) {
      expect(icon.baseline).toBe('middle')
      expect(icon.offset).toBeLessThan(3)
    }

    await page.locator('.exampleViewer').evaluate(element => (element as HTMLElement).style.setProperty('--vis-graph-node-dominant-baseline', 'central'))
    await expect(icons.first()).toHaveCSS('dominant-baseline', 'central')
  })
}

test('keeps SVG use icons centered', async ({ page }) => {
  await page.goto('/examples/Graph/Graph:%20SVG%20Node%20Icons?duration=0')
  const icons = page.locator('.exampleViewer g[class*="icon"] > use')
  await expect(icons.first()).toBeVisible()
  const bounds = await icons.evaluateAll(elements => elements.map(element => {
    const use = element as SVGUseElement
    return { x: use.x.baseVal.value, y: use.y.baseVal.value, width: use.width.baseVal.value, height: use.height.baseVal.value }
  }))
  for (const box of bounds) {
    expect(box.x + box.width / 2).toBe(0)
    expect(box.y + box.height / 2).toBe(0)
  }
})
