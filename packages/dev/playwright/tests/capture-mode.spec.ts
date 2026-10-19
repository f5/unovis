import { test, expect } from '@playwright/test'
import { CAPTURE_DEFAULTS } from '../../src/capture/constants'

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
