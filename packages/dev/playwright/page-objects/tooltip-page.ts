import { Page, Locator } from '@playwright/test'

export class TooltipPage {
  readonly page: Page
  readonly scatterPoints: Locator
  readonly tooltipContainer: Locator

  // Scatter plot selectors
  readonly scatterPointCategory0: Locator
  readonly scatterPointCategory1: Locator
  readonly scatterPointCategory2: Locator
  readonly scatterPointCategory3: Locator
  readonly scatterTooltip: Locator

  constructor (page: Page) {
    this.page = page
    this.scatterPoints = page.locator('[visScatterPointE2eTestId]')
    this.tooltipContainer = page.locator('[visTooltipE2eTestId]')

    // Specific category selectors
    this.scatterPointCategory0 = page.locator('[visScatterPointE2eTestId="scatter-point-category-0"]')
    this.scatterPointCategory1 = page.locator('[visScatterPointE2eTestId="scatter-point-category-1"]')
    this.scatterPointCategory2 = page.locator('[visScatterPointE2eTestId="scatter-point-category-2"]')
    this.scatterPointCategory3 = page.locator('[visScatterPointE2eTestId="scatter-point-category-3"]')
    this.scatterTooltip = page.locator('[visTooltipE2eTestId="scatter-tooltip"]')
  }

  async navigateToTooltipExample (): Promise<void> {
    await this.page.goto('/examples/Tooltip/Tooltip:%20Empty%20Content')
    await this.page.waitForTimeout(300)
  }

  async waitForScatterPointsToLoad (): Promise<void> {
    await this.scatterPoints.first().waitFor({ state: 'visible' })
  }
}

export class GraphTooltipPage {
  readonly page: Page
  readonly graphNodes: Locator
  readonly graphTooltip: Locator

  // Specific node selectors
  readonly nodeString: Locator
  readonly nodeHex: Locator
  readonly nodeShortHex: Locator
  readonly nodeRGB: Locator
  readonly nodeNone: Locator

  constructor (page: Page) {
    this.page = page
    this.graphNodes = page.locator('[visGraphNodeE2eTestId]')
    this.graphTooltip = page.locator('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]')

    // Specific node selectors
    this.nodeString = page.locator('[visGraphNodeE2eTestId="node-String"]')
    this.nodeHex = page.locator('[visGraphNodeE2eTestId="node-Hex"]')
    this.nodeShortHex = page.locator('[visGraphNodeE2eTestId="node-Short hex"]')
    this.nodeRGB = page.locator('[visGraphNodeE2eTestId="node-RGB"]')
    this.nodeNone = page.locator('[visGraphNodeE2eTestId="node-None"]')
  }

  async navigateToGraphExample (): Promise<void> {
    // duration=0 disables enter/update animations so the force-layout nodes are
    // rendered at their final, deterministic positions before we screenshot.
    await this.page.goto('/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip?duration=0')
    await this.graphNodes.first().waitFor({ state: 'visible' })
    await this.waitForGraphToSettle()
  }

  /**
   * Waits until the graph nodes stop moving so screenshots are stable.
   * Polls the combined bounding box of the node group until it is unchanged
   * across consecutive frames.
   */
  async waitForGraphToSettle (): Promise<void> {
    await this.page.waitForFunction(() => {
      const nodes = document.querySelectorAll('[visGraphNodeE2eTestId]')
      if (!nodes.length) return false

      const win = window as unknown as { graphSettleState?: { key: string; count: number } }
      const key = Array.from(nodes)
        .map(n => {
          const r = (n as SVGGraphicsElement).getBoundingClientRect()
          return `${Math.round(r.x)},${Math.round(r.y)}`
        })
        .join('|')

      const prev = win.graphSettleState
      if (prev && prev.key === key) {
        win.graphSettleState = { key, count: prev.count + 1 }
      } else {
        win.graphSettleState = { key, count: 0 }
      }
      // Require a few stable frames in a row before considering it settled.
      return (win.graphSettleState?.count ?? 0) >= 3
    }, undefined, { timeout: 10000, polling: 100 })
  }
}

export class LeafletTooltipPage {
  readonly page: Page
  readonly leafletPoints: Locator
  readonly leafletTooltip: Locator

  // Specific point selectors
  readonly pointAP0: Locator
  readonly pointAP2: Locator
  readonly pointAP3: Locator
  readonly pointAP4: Locator

  constructor (page: Page) {
    this.page = page
    this.leafletPoints = page.locator('[visLeafletPointE2eTestId]')
    this.leafletTooltip = page.locator('[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]')

    // Specific point selectors
    this.pointAP0 = page.locator('[visLeafletPointE2eTestId="leaflet-point-ap-0"]')
    this.pointAP2 = page.locator('[visLeafletPointE2eTestId="leaflet-point-ap-2"]')
    this.pointAP3 = page.locator('[visLeafletPointE2eTestId="leaflet-point-ap-3"]')
    this.pointAP4 = page.locator('[visLeafletPointE2eTestId="leaflet-point-ap-4"]')
  }

  async navigateToLeafletExample (): Promise<void> {
    // staticData=1 disables the example's timed color-map/data update, and
    // duration=0 removes point/zoom animations so the map is deterministic.
    await this.page.goto('/examples/Leaflet/Color%20Map?staticData=1&duration=0')
  }

  async waitForMapReady (): Promise<void> {
    // Under heavy GPU contention (multiple Chromium projects rendering maps at
    // once) the WebGL map occasionally fails to draw its points. Reload once if
    // the points don't appear rather than failing the whole test.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.leafletPoints.first().waitFor({ state: 'visible', timeout: 15000 })
        break
      } catch (e) {
        if (attempt === 1) throw e
        await this.page.reload()
      }
    }
    await this.waitForMapIdle()

    // The cold-load auto-fit can settle at a slightly different zoom, which
    // sometimes clusters a hovered point (e.g. ap-0). Clicking "Fit View" once
    // the container is fully sized forces a deterministic, repeatable view so
    // clustering (and therefore which points exist) is identical every run.
    await this.page.locator('[data-e2e-test-id="leaflet-fit-view"]').click()
    await this.waitForMapIdle()
    await this.waitForPointsToStabilize()

    // The tests hover specific points (ap-0, ap-2, ap-3, ap-4). Wait until all
    // the individually-hovered points exist as their own markers.
    await Promise.all(
      ['ap-0', 'ap-2', 'ap-3', 'ap-4'].map(name =>
        this.page.locator(`[visLeafletPointE2eTestId="leaflet-point-${name}"]`)
          .first().waitFor({ state: 'visible', timeout: 15000 })
      )
    )
  }

  /**
   * Waits until the rendered point count stops changing. On the first cold load
   * the map's fitView/clustering can still be settling, which briefly merges or
   * splits points (e.g. `ap-0`), so we hold until clustering is final.
   */
  async waitForPointsToStabilize (): Promise<void> {
    await this.page.waitForFunction(() => {
      const count = document.querySelectorAll('[visLeafletPointE2eTestId]').length
      const win = window as unknown as { pointCountState?: { count: number; stable: number } }
      const prev = win.pointCountState
      if (prev && prev.count === count && count > 0) {
        win.pointCountState = { count, stable: prev.stable + 1 }
      } else {
        win.pointCountState = { count, stable: 0 }
      }
      return (win.pointCountState?.stable ?? 0) >= 3
    }, undefined, { timeout: 15000, polling: 150 })
  }

  /**
   * Waits for the WebGL map to stop rendering. Percy (used by the Cypress
   * suite) never captured the canvas so tile-load timing was irrelevant there;
   * Playwright captures live canvas pixels, so we must wait until all tiles are
   * fetched and the canvas stops changing before taking a screenshot.
   */
  async waitForMapIdle (): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement | null
      if (!canvas) return false

      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const win = window as unknown as { mapSettleState?: { hash: number; count: number } }

      // Sample a small strip of the framebuffer and hash it to detect changes.
      let hash = 0
      if (gl) {
        const w = Math.min(canvas.width, 64)
        const h = Math.min(canvas.height, 64)
        const pixels = new Uint8Array(w * h * 4)
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        for (let i = 0; i < pixels.length; i += 97) hash = (hash * 31 + pixels[i]) >>> 0
      }

      const prev = win.mapSettleState
      if (prev && prev.hash === hash) {
        win.mapSettleState = { hash, count: prev.count + 1 }
      } else {
        win.mapSettleState = { hash, count: 0 }
      }
      return (win.mapSettleState?.count ?? 0) >= 3
    }, undefined, { timeout: 15000, polling: 150 })
    // Small settle buffer for label/point transitions after tiles are stable.
    await this.page.waitForTimeout(500)
  }
}
