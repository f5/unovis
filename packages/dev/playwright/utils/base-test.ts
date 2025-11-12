import { test as base, expect, Page, Locator } from '@playwright/test'

export interface TooltipTestContext {
  tooltipUtils: TooltipUtils;
  visualUtils: VisualUtils;
  interactionUtils: InteractionUtils;
}

export class TooltipUtils {
  constructor (private page: Page) {}

  /**
   * Triggers tooltip by hovering over an element at its center
   * Equivalent to Cypress checkTooltip command
   */
  async triggerTooltip (selector: string): Promise<void> {
    const element = this.page.locator(selector).first()
    await expect(element).toBeVisible()

    // Scroll into view if needed
    await element.scrollIntoViewIfNeeded()
    // await element.hover({ force: true })
    await element.hover()
  }

  /**
   * Clears tooltip by moving mouse away or triggering mouseout
   */
  async clearTooltip (selector: string): Promise<void> {
    const element = this.page.locator(selector).first()
    await element.dispatchEvent('mouseout')
  }

  /**
   * Verifies tooltip visibility and content
   */
  async verifyTooltip (
    tooltipSelector: string,
    options: {
      shouldBeVisible: boolean;
      expectedContent?: string;
      shouldNotContainContent?: string;
    }
  ): Promise<void> {
    const tooltip = this.page.locator(tooltipSelector)

    if (options.shouldBeVisible) {
      // Wait for tooltip to be visible with a timeout
      await expect(tooltip).toBeVisible({ timeout: 5000 })

      if (options.expectedContent !== undefined) {
        if (options.expectedContent === '') {
          const text = await tooltip.textContent()
          expect(text?.trim()).toBe('')
        } else {
          await expect(tooltip).toContainText(options.expectedContent)
        }
      }

      if (options.shouldNotContainContent) {
        await expect(tooltip).not.toContainText(options.shouldNotContainContent)
      }
    } else {
      // For "should not be visible", we need to wait a bit to ensure tooltip doesn't appear
      await this.page.waitForTimeout(500)
      await expect(tooltip).not.toBeVisible()
    }
  }

  /**
   * Executes a tooltip interaction sequence
   */
  async executeTooltipSequence (steps: Array<{
    elementSelector: string;
    tooltipSelector: string;
    expectedContent?: string;
    shouldNotContainContent?: string;
    shouldBeVisible?: boolean;
  }>): Promise<void> {
    for (const step of steps) {
      await this.triggerTooltip(step.elementSelector)
      await this.verifyTooltip(step.tooltipSelector, {
        shouldBeVisible: step.shouldBeVisible ?? true,
        expectedContent: step.expectedContent,
        shouldNotContainContent: step.shouldNotContainContent,
      })
      await this.clearTooltip(step.elementSelector)
    }
  }
}

export class VisualUtils {
  constructor (private page: Page) {}

  /**
   * Takes a screenshot with consistent naming and options
   */
  async takeScreenshot (
    name: string,
    options?: {
      element?: Locator;
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
    }
  ): Promise<void> {
    const screenshotOptions = {
      fullPage: options?.fullPage ?? false,
      clip: options?.clip,
    }

    const fileName = `${name}.png`

    if (options?.element) {
      await expect(options.element).toHaveScreenshot(fileName)
    } else {
      await expect(this.page).toHaveScreenshot(fileName, screenshotOptions)
    }
  }

  /**
   * Waits for all animations and transitions to complete
   */
  async waitForStability (timeout = 1000): Promise<void> {
    await this.page.waitForTimeout(300)
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(timeout)
  }
}

export class InteractionUtils {
  constructor (private page: Page) {}

  /**
   * Sets up network interceptions for map tiles
   */
  async setupMapInterceptions (): Promise<void> {
    await this.page.route('https://demotiles.maplibre.org/tiles/tiles.json', route => route.continue())
    await this.page.route(/^https:\/\/demotiles\.maplibre\.org\/tiles\/(\d+)\/(\d+)\/(\d+)\.pbf/, route => route.continue())
  }

  /**
   * Navigates to a URL and waits for page to be ready
   */
  async navigateAndWait (url: string, waitTime = 300): Promise<void> {
    await this.page.goto(url)
    await this.page.waitForTimeout(waitTime)
  }

  /**
   * Clicks at coordinates (useful for dismissing tooltips)
   */
  async clickAt (x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y)
  }
}

// Create extended test with utilities
export const test = base.extend<TooltipTestContext>({
  tooltipUtils: async ({ page }, use) => {
    await use(new TooltipUtils(page))
  },
  visualUtils: async ({ page }, use) => {
    await use(new VisualUtils(page))
  },
  interactionUtils: async ({ page }, use) => {
    await use(new InteractionUtils(page))
  },
})

export { expect }
