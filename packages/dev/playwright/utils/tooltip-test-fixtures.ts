import { test as base, expect, Page, Locator } from '@playwright/test'

export interface TooltipTestContext {
  tooltipUtils: TooltipUtils;
  visualUtils: VisualUtils;
}

export class TooltipUtils {
  constructor (private page: Page) {}

  /**
   * Triggers tooltip by hovering over an element at its center
   * Equivalent to Cypress checkTooltip command
   */
  /**
   * @param selector Element that triggers the tooltip on hover.
   * @param expectTooltipSelector When provided, retries the hover until this
   *   tooltip becomes visible (needed for heavy WebGL maps).
   * @param force Skips actionability checks. Only pass `true` for Leaflet map
   *   points, which the example viewer's code panel can overlap without visually
   *   blocking them. Scatter/Graph targets are unobstructed and should not force.
   */
  async triggerTooltip (selector: string, expectTooltipSelector?: string, force = false): Promise<void> {
    const element = this.page.locator(selector).first()
    // A WebGL map can briefly re-cluster a point after it first appears, so give
    // the target element a generous window to (re)materialize before hovering.
    await expect(element).toBeVisible({ timeout: 15000 })

    // Scroll into view if needed
    await element.scrollIntoViewIfNeeded()

    // The Tooltip core listens for a real `mousemove` on the component and reads
    // the event's composedPath to find the trigger. WebKit (and WebGL maps under
    // load) can miss a single hover, so move the real pointer onto the element's
    // center and nudge it by a pixel to guarantee a mousemove with the right path.
    const hoverOnce = async (): Promise<void> => {
      await element.hover({ force })
      const box = await element.boundingBox()
      if (box) {
        const cx = box.x + box.width / 2
        const cy = box.y + box.height / 2
        // Nudge by a pixel to force a mousemove, then return to the exact center
        // so the tooltip's final resting position matches the committed baselines.
        await this.page.mouse.move(cx + 1, cy)
        await this.page.mouse.move(cx, cy)
      }
    }

    await hoverOnce()

    // On heavy WebGL maps the first hover can land before the point is
    // interactive; retry a few times until the expected tooltip shows up.
    if (expectTooltipSelector) {
      const tooltip = this.page.locator(`${expectTooltipSelector}:visible`)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await expect(tooltip).toBeVisible({ timeout: 2000 })
          return
        } catch {
          await this.page.mouse.move(0, 0)
          await hoverOnce()
        }
      }
    }
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
    // Some tooltip targets render more than one element matching the selector
    // (e.g. an always-present empty wrapper alongside the populated one), so
    // scope visibility checks to the currently visible match to avoid strict-mode violations.
    const tooltip = options.shouldBeVisible
      ? this.page.locator(`${tooltipSelector}:visible`)
      : this.page.locator(tooltipSelector)

    if (options.shouldBeVisible) {
      // Wait for tooltip to be visible with a timeout
      await expect(tooltip).toBeVisible({ timeout: 5000 })

      if (options.expectedContent !== undefined) {
        if (options.expectedContent === '') {
          // Use an auto-retrying assertion instead of a one-shot textContent()
          // read, since the tooltip content can briefly hold the previous
          // value while the new element's data is applied.
          await expect(tooltip).toHaveText('')
        } else {
          await expect(tooltip).toContainText(options.expectedContent)
        }
      }

      if (options.shouldNotContainContent) {
        await expect(tooltip).not.toContainText(options.shouldNotContainContent)
      }
    } else {
      // Auto-retrying assertion for the "no tooltip" case instead of a fixed
      // sleep, so it's neither flaky on slow machines nor wasteful on fast ones.
      await expect(tooltip).toBeHidden({ timeout: 1000 })
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
    force?: boolean;
  }>): Promise<void> {
    for (const step of steps) {
      const expectVisible = step.shouldBeVisible ?? true
      await this.triggerTooltip(step.elementSelector, expectVisible ? step.tooltipSelector : undefined, step.force)
      await this.verifyTooltip(step.tooltipSelector, {
        shouldBeVisible: expectVisible,
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
      mask?: Locator[];
      maxDiffPixelRatio?: number;
    }
  ): Promise<void> {
    const fileName = `${name}.png`

    if (options?.element) {
      await expect(options.element).toHaveScreenshot(fileName, {
        mask: options.mask,
        maxDiffPixelRatio: options.maxDiffPixelRatio,
      })
    } else {
      await expect(this.page).toHaveScreenshot(fileName, {
        fullPage: options?.fullPage ?? false,
        clip: options?.clip,
        mask: options?.mask,
        maxDiffPixelRatio: options?.maxDiffPixelRatio,
      })
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

// Create extended test with utilities
export const test = base.extend<TooltipTestContext>({
  tooltipUtils: async ({ page }, use) => {
    await use(new TooltipUtils(page))
  },
  visualUtils: async ({ page }, use) => {
    await use(new VisualUtils(page))
  },
})

export { expect }
