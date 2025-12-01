import { test, expect } from '../utils/base-test'
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

      await visualUtils.takeScreenshot('Normal-Tooltip')
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

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Empty-String')
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

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Null-No-Tooltip')
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

      await visualUtils.takeScreenshot('Tooltip-Empty-Content-Undefined')
      await tooltipUtils.clearTooltip(selector)
    })

    test('should show tooltip sequence: category 1 (empty) -> category 0 (normal) -> category 1 (empty again)', async ({
      tooltipUtils,
    }) => {
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
          expectedContent: '',
          shouldNotContainContent: 'Normal tooltip',
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

      await visualUtils.takeScreenshot('Graph-Tooltip-Normal-Tooltip-Visible')
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

      await visualUtils.takeScreenshot('Graph-Tooltip-Empty-String-Empty-Tooltip')
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

      await visualUtils.takeScreenshot('Graph-Tooltip-Null-No-Tooltip')
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

      await visualUtils.takeScreenshot('Graph-Tooltip-Undefined-Empty-Tooltip')
      await tooltipUtils.clearTooltip('[visGraphNodeE2eTestId="node-None"]')
    })

    test('should show tooltip sequence: empty string node -> hex color node -> empty string node', async ({
      tooltipUtils,
    }) => {
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
          expectedContent: '',
          shouldNotContainContent: 'This is a hex color',
        },
      ])
    })
  })

  test.describe('Leaflet Map Component Tooltips', () => {
    let leafletPage: LeafletTooltipPage

    test.use({ viewport: { width: 1800, height: 1200 } })

    test.beforeEach(async ({ page, interactionUtils }) => {
      leafletPage = new LeafletTooltipPage(page)
      await interactionUtils.setupMapInterceptions()
      await leafletPage.navigateToLeafletExample()
      await leafletPage.setupMapInterceptions()
    })

    test('should show empty tooltip for point with empty string description (ap-0)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-0"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Empty-String')
    })

    test('should show normal tooltip for point with maintenance mode description (ap-2)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-2"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: 'Maintenance mode',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Maintenance-Mode')
    })

    test('should show empty tooltip for point with undefined description (ap-3)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-3"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]', {
        shouldBeVisible: true,
        expectedContent: '',
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Undefined-Empty-Tooltip')
    })

    test('should not show tooltip for point with null description (ap-4)', async ({
      tooltipUtils,
      visualUtils,
    }) => {
      const selector = '[visLeafletPointE2eTestId="leaflet-point-ap-4"]'

      await tooltipUtils.triggerTooltip(selector)
      await tooltipUtils.verifyTooltip('[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]', {
        shouldBeVisible: false,
      })

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Null-No-Tooltip')
    })

    test('should show tooltip sequence: empty string point (ap-0) -> maintenance mode point (ap-2) -> empty string point (ap-0)', async ({
      tooltipUtils,
      visualUtils,
      interactionUtils,
    }) => {
      const emptySelector = '[visLeafletPointE2eTestId="leaflet-point-ap-0"]'
      const maintenanceSelector = '[visLeafletPointE2eTestId="leaflet-point-ap-2"]'
      const tooltipSelector = '[visLeafletMapTooltipE2eTestId="leaflet-map-tooltip"]'

      // First interaction
      await tooltipUtils.triggerTooltip(emptySelector)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: '',
        shouldNotContainContent: 'Maintenance mode',
      })
      await interactionUtils.clickAt(0, 0)

      // Second interaction
      await tooltipUtils.triggerTooltip(maintenanceSelector)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: 'Maintenance mode',
      })
      await interactionUtils.clickAt(0, 0)

      // Third interaction
      await tooltipUtils.triggerTooltip(emptySelector)
      await tooltipUtils.verifyTooltip(tooltipSelector, {
        shouldBeVisible: true,
        expectedContent: '',
        shouldNotContainContent: 'Maintenance mode',
      })
      await interactionUtils.clickAt(0, 0)

      await visualUtils.takeScreenshot('Leaflet-Map-Tooltip-Sequence-Empty-Maintenance-Empty')
    })
  })
})
