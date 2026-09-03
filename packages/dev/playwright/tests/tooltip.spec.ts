import { test } from '../utils/tooltip-test-fixtures'
import { TooltipPage, GraphTooltipPage, LeafletTooltipPage } from '../page-objects/tooltip-page'

test.describe('Tooltip Tests', () => {
  test.describe('Tooltip Component', () => {
    let tooltipPage: TooltipPage

    test.beforeEach(async ({ page }) => {
      tooltipPage = new TooltipPage(page)
      await tooltipPage.navigateToTooltipExample()
      await tooltipPage.waitForScatterPointsToLoad()
    })

    test('should show normal tooltip for category 0 points (red)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visScatterPointE2eTestId="scatter-point-category-0"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visTooltipE2eTestId="scatter-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: 'Normal tooltip',
      })

      await visualUtils.takeScreenshot('Normal-Tooltip', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show empty tooltip for category 1 points (blue - empty string)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visScatterPointE2eTestId="scatter-point-category-1"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visTooltipE2eTestId="scatter-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
        shouldNotContainContent: 'Normal tooltip',
      })

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Empty-String', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should not show tooltip for category 2 points (green - null)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visScatterPointE2eTestId="scatter-point-category-2"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visTooltipE2eTestId="scatter-tooltip"]', {
        shouldBeVisible: false,
      })

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Null-No-Tooltip', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show empty tooltip for category 3 points (orange - undefined)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visScatterPointE2eTestId="scatter-point-category-3"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visTooltipE2eTestId="scatter-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
        shouldNotContainContent: 'Normal tooltip',
      })

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Undefined', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip sequence: category 1 (empty) -> category 0 (normal) -> category 1 (retains previous content)', async ({
      tooltipUtils,
    }) => {
      // The Tooltip core intentionally keeps the previous content when a
      // trigger returns an empty string (see Tooltip.render in @unovis/ts),
      // so re-hovering an empty-content point after a populated one still
      // shows the last rendered text rather than clearing it.
      await tooltipUtils.executeTooltipSequence([
        {
          elementSelector: '[visScatterPointE2eTestId="scatter-point-category-1"]',
          tooltipSelector: '[visTooltipE2eTestId="scatter-tooltip"]',
          expectedContent: '',
          shouldNotContainContent: 'Normal tooltip',
        },
        {
          elementSelector: '[visScatterPointE2eTestId="scatter-point-category-0"]',
          tooltipSelector: '[visTooltipE2eTestId="scatter-tooltip"]',
          expectedContent: 'Normal tooltip',
        },
        {
          elementSelector: '[visScatterPointE2eTestId="scatter-point-category-1"]',
          tooltipSelector: '[visTooltipE2eTestId="scatter-tooltip"]',
          expectedContent: 'Normal tooltip',
        },
      ])
    })
  })

  test.describe('Graph Component Tooltips', () => {
    let graphPage: GraphTooltipPage

    test.beforeEach(async ({ page }) => {
      graphPage = new GraphTooltipPage(page)
      await graphPage.navigateToGraphExample()
    })

    test('should show normal tooltip for nodes with valid content', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      await tooltipUtils.triggerTooltip('[visGraphNodeE2eTestId="node-String"]')
      await tooltipUtils.verifyTooltip('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: 'This is a string color',
      })

      await visualUtils.takeScreenshot('Graph-Tooltip-Normal-Tooltip-Visible', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-String"]')
    })

    test('should show normal tooltip for hex color node', async ({
      tooltipUtils,
    }) => {
      await tooltipUtils.triggerTooltip('[visGraphNodeE2eTestId="node-Hex"]')
      await tooltipUtils.verifyTooltip('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: 'This is a hex color',
      })

      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-Hex"]')
    })

    test('should show empty tooltip for empty string node', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      await tooltipUtils.triggerTooltip('[visGraphNodeE2eTestId="node-Short hex"]')
      await tooltipUtils.verifyTooltip('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
      })

      await visualUtils.takeScreenshot('Graph-Tooltip-Empty-String-Empty-Tooltip', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-Short hex"]')
    })

    test('should not show tooltip for null node', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      await tooltipUtils.triggerTooltip('[visGraphNodeE2eTestId="node-RGB"]')
      await tooltipUtils.verifyTooltip('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]', {
        shouldBeVisible: false,
      })

      await visualUtils.takeScreenshot('Graph-Tooltip-Null-No-Tooltip', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-RGB"]')
    })

    test('should show empty tooltip for undefined node', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      await tooltipUtils.triggerTooltip('[visGraphNodeE2eTestId="node-None"]')
      await tooltipUtils.verifyTooltip('[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
      })

      await visualUtils.takeScreenshot('Graph-Tooltip-Undefined-Empty-Tooltip', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-None"]')
    })

    test('should show tooltip sequence: empty string node -> hex color node -> empty string node (retains previous content)', async ({
      tooltipUtils,
    }) => {
      // The Tooltip core intentionally keeps the previous content when a
      // trigger returns an empty string (see Tooltip.render in @unovis/ts),
      // so re-hovering an empty-content node after a populated one still
      // shows the last rendered text rather than clearing it.
      await tooltipUtils.executeTooltipSequence([
        {
          elementSelector: '[visGraphNodeE2eTestId="node-Short hex"]',
          tooltipSelector: '[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]',
          expectedContent: '',
          shouldNotContainContent: 'This is a hex color',
        },
        {
          elementSelector: '[visGraphNodeE2eTestId="node-Hex"]',
          tooltipSelector: '[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]',
          expectedContent: 'This is a hex color',
        },
        {
          elementSelector: '[visGraphNodeE2eTestId="node-Short hex"]',
          tooltipSelector: '[visGraphNodeTooltipE2eTestId="graph-node-tooltip"]',
          expectedContent: 'This is a hex color',
        },
      ])
    })
  })

  test.describe('Leaflet Map Component Tooltips', () => {
    test.use({ viewport: { width: 1800, height: 1200 } })
    // WebGL maps are heavy; running several in parallel starves the GPU and
    // makes tiles/points render late, so run these tests serially for stability.
    test.describe.configure({ mode: 'serial' })

    // MapLibre/WebGL only renders reliably in headless Chromium (via ANGLE +
    // SwiftShader); Firefox and WebKit headless don't render the vector map
    // consistently. It also runs on a single project (the purpose-built
    // `visual-tests`) so two Chromium projects don't contend for the software
    // GPU and flake the map rendering.
    test.skip(
      () => test.info().project.name !== 'visual-tests',
      'Leaflet WebGL map runs only on the Chromium-based visual-tests project'
    )

    let leafletPage: LeafletTooltipPage

    test.beforeEach(async ({ page }) => {
      leafletPage = new LeafletTooltipPage(page)
      await leafletPage.navigateToLeafletExample()
      await leafletPage.waitForMapReady()
    })

    test('should show tooltip with point name (ap-0)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-0"]'
      const tooltipSelector = '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]'

      await tooltipUtils.triggerTooltip(selector, tooltipSelector, true)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: 'ap-0',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-ap-0', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip with point name (ap-2)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-2"]'
      const tooltipSelector = '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]'

      await tooltipUtils.triggerTooltip(selector, tooltipSelector, true)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: 'ap-2',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-ap-2', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip with point name (ap-3)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-3"]'
      const tooltipSelector = '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]'

      await tooltipUtils.triggerTooltip(selector, tooltipSelector, true)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: 'ap-3',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-ap-3', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip with point name (ap-4)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-4"]'
      const tooltipSelector = '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]'

      await tooltipUtils.triggerTooltip(selector, tooltipSelector, true)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: 'ap-4',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-ap-4', { maxDiffPixelRatio: 0.02 })
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip sequence: ap-0 -> ap-2 -> ap-0', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      await tooltipUtils.executeTooltipSequence([
        {
          elementSelector: '[visLeafletPointE2eTestId="leaflet-point-ap-0"]',
          tooltipSelector: '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]',
          expectedContent: 'ap-0',
          force: true,
        },
        {
          elementSelector: '[visLeafletPointE2eTestId="leaflet-point-ap-2"]',
          tooltipSelector: '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]',
          expectedContent: 'ap-2',
          force: true,
        },
        {
          elementSelector: '[visLeafletPointE2eTestId="leaflet-point-ap-0"]',
          tooltipSelector: '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]',
          expectedContent: 'ap-0',
          force: true,
        },
      ])

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Sequence-ap-0-ap-2-ap-0', { maxDiffPixelRatio: 0.02 })
    })
  })
})
