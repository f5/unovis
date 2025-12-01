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
    await this.page.goto('/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip')
    await this.page.waitForTimeout(300)
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
    await this.page.goto('/examples/Leaflet/Color%20Map')
  }

  async setupMapInterceptions (): Promise<void> {
    await this.page.route('https://demotiles.maplibre.org/tiles/tiles.json', route => route.continue())
    await this.page.route(/^https:\/\/demotiles\.maplibre\.org\/tiles\/(\d+)\/(\d+)\/(\d+)\.pbf/, route => route.continue())

    // Wait for map tiles to load
    await this.page.waitForTimeout(1000)
  }
}
