// filepath: /Users/s.hanumandla/repos/vis/unovis/packages/dev/playwright/tests/unovis.spec.ts
import { test, expect } from '@playwright/test'
import { urls } from '../urls'

const scopeSelector = '.exampleViewer'

test.describe('Unovis Visual Tests', () => {
  test('Load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Unovis/)

    // Take a screenshot of the homepage
    await expect(page).toHaveScreenshot('homepage.png')
  })

  // Test each URL from the urls configuration
  for (const testCase of urls) {
    test(testCase.title, async ({ page }) => {
      // Navigate to the test URL with duration parameter
      const url = new URL(testCase.url, 'http://localhost:9501')
      if (testCase.duration > 0) {
        url.searchParams.set('duration', testCase.duration.toString())
      }

      await page.goto(url.pathname + url.search)

      // Wait for the specified duration or minimum 1 second
      const waitTime = testCase.duration > 1000 ? testCase.duration : 1000
      await page.waitForTimeout(waitTime)

      // Wait for the example viewer to be visible
      const exampleViewer = page.locator(scopeSelector)
      await expect(exampleViewer).toBeVisible()

      // Take a screenshot of the specific component
    })
  }
})
