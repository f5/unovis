// filepath: /Users/s.hanumandla/repos/vis/unovis/packages/dev/playwright/tests/unovis.spec.ts
import { test, expect } from '@playwright/test'
import { urls } from '../urls'

const scopeSelector = '.exampleViewer'

test.describe('Unovis Smoke Tests', () => {
  test('Load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Unovis/)

    // Take a screenshot of the homepage
    await expect(page).toHaveScreenshot('homepage.png')
  })

  // Navigate to each example URL and verify it renders without errors.
  for (const testCase of urls) {
    test(testCase.title, async ({ page }) => {
      // Heavier examples (e.g. TopoJSON maps) load large datasets/chunks, so
      // give them a larger budget to avoid timing out under parallel load.
      if (testCase.duration > 0) test.slow()

      // Navigate to the test URL with duration parameter
      const url = new URL(testCase.url, 'http://localhost:9501')
      if (testCase.duration > 0) {
        url.searchParams.set('duration', testCase.duration.toString())
      }

      // Wait only for the DOM, not every network resource: some map examples
      // keep fetching tiles/topojson which can otherwise stall `goto` near the
      // navigation timeout.
      await page.goto(url.pathname + url.search, { waitUntil: 'domcontentloaded' })

      // Wait for the example viewer to render before the settle delay.
      const exampleViewer = page.locator(scopeSelector)
      await expect(exampleViewer).toBeVisible({ timeout: 20000 })

      // Give the example time to finish its entry animation / data load.
      const waitTime = testCase.duration > 1000 ? testCase.duration : 1000
      await page.waitForTimeout(waitTime)
    })
  }
})
