describe('Tooltip Tests', () => {
  describe('Tooltip Component', () => {
    before(() => {
      cy.visit('/examples/Tooltip/Tooltip:%20Empty%20Content')
      cy.wait(300)
      cy.get('[visScatterPointE2eTestId]')
        .should('have.length.at.least', 1)
        .and('be.visible')
    })

    it('should show normal tooltip for category 0 points (red)', () => {
      const selector = '[visScatterPointE2eTestId="scatter-point-category-0"]'
      cy.checkTooltip(selector)
      cy.get("[visTooltipE2eTestId='scatter-tooltip']")
        .should('be.visible')
        .and('contain.text', 'Normal tooltip')
      cy.percySnapshot('Normal Tooltip')
      cy.get(selector).first().trigger('mouseout')
    })

    it('should show empty tooltip for category 1 points (blue - empty string) and not normal tooltip', () => {
      const selector = "[visScatterPointE2eTestId='scatter-point-category-1']"
      cy.checkTooltip(selector)
      cy.get("[visTooltipE2eTestId='scatter-tooltip']")
        .should('be.visible')
        .and('not.contain.text', 'Normal tooltip')
      cy.percySnapshot('Tooltip Empty Content - Empty String')
      cy.get(selector).first().trigger('mouseout')
    })

    it('should not show tooltip for category 2 points (green - null)', () => {
      const selector = "[visScatterPointE2eTestId='scatter-point-category-2']"
      cy.checkTooltip(selector)
      cy.get("[visTooltipE2eTestId='scatter-tooltip']").should('not.be.visible')
      cy.percySnapshot('Tooltip Empty Content - Null No Tooltip')
      cy.get(selector).first().trigger('mouseout')
    })

    it('should not show tooltip for category 3 points (orange - undefined)', () => {
      const selector = "[visScatterPointE2eTestId='scatter-point-category-3']"
      cy.checkTooltip(selector)
      cy.get("[visTooltipE2eTestId='scatter-tooltip']")
        .should('be.visible')
        .and('not.contain.text', 'Normal tooltip')
      cy.percySnapshot('Tooltip Empty Content - Undefined')
      cy.get(selector).first().trigger('mouseout')
    })

    it('should show tooltip sequence: category 1 (empty) -> category 0 (normal) -> category 1 (empty again)', () => {
      const cat1Selector =
        "[visScatterPointE2eTestId='scatter-point-category-1']"
      const cat0Selector =
        "[visScatterPointE2eTestId='scatter-point-category-0']"
      const tooltipSelector = "[visTooltipE2eTestId='scatter-tooltip']"

      cy.checkTooltip(cat1Selector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('not.contain.text', 'Normal tooltip')
        .invoke('text')
        .then(t => expect(t.trim()).to.eq(''))
      cy.get(cat1Selector).first().trigger('mouseout')

      cy.checkTooltip(cat0Selector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('contain.text', 'Normal tooltip')
        .invoke('text')
        .then(t => expect(t).to.contain('Normal tooltip'))
      cy.get(cat0Selector).first().trigger('mouseout')

      cy.checkTooltip(cat1Selector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('not.contain.text', 'Normal tooltip')
        .invoke('text')
        .then(t => expect(t.trim()).to.eq(''))
      cy.get(cat1Selector).first().trigger('mouseout')
    })
  })

  describe('Graph Component Tooltips', () => {
    before(() => {
      cy.visit(
        '/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip'
      )
      cy.wait(300)
    })

    it('should show normal tooltip for nodes with valid content', () => {
      cy.checkTooltip("[visGraphNodeE2eTestId='node-String']")
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']")
        .should('be.visible')
        .and('contain.text', 'This is a string color')
      cy.percySnapshot('Graph Tooltip - Normal Tooltip Visible')
      cy.get("[visGraphNodeE2eTestId='node-String']")
        .first()
        .trigger('mouseout')
    })

    it('should show normal tooltip for hex color node', () => {
      cy.checkTooltip("[visGraphNodeE2eTestId='node-Hex']")
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']").should(
        'be.visible'
      )
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']").should(
        'contain.text',
        'This is a hex color'
      )
      cy.get("[visGraphNodeE2eTestId='node-Hex']").first().trigger('mouseout')
    })

    it('should show empty tooltip for empty string node', () => {
      cy.checkTooltip("[visGraphNodeE2eTestId='node-Short hex']")
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']")
        .should('be.visible')
        .and('contain.text', '')
      cy.percySnapshot('Graph Tooltip - Empty String Empty Tooltip')
      cy.get("[visGraphNodeE2eTestId='node-Short hex']")
        .first()
        .trigger('mouseout')
    })

    it('should not show tooltip for null node', () => {
      cy.checkTooltip("[visGraphNodeE2eTestId='node-RGB']")
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']").should(
        'not.be.visible'
      )
      cy.percySnapshot('Graph Tooltip - Null No Tooltip')
      cy.get("[visGraphNodeE2eTestId='node-RGB']").first().trigger('mouseout')
    })

    it('should show empty tooltip for undefined node', () => {
      cy.checkTooltip("[visGraphNodeE2eTestId='node-None']")
      cy.get("[visGraphNodeTooltipE2eTestId='graph-node-tooltip']")
        .should('be.visible')
        .and('contain.text', '')
      cy.percySnapshot('Graph Tooltip - Undefined Empty Tooltip')
      cy.get("[visGraphNodeE2eTestId='node-None']").first().trigger('mouseout')
    })

    it('should show tooltip sequence: empty string node -> hex color node -> empty string node', () => {
      const emptySelector = "[visGraphNodeE2eTestId='node-Short hex']"
      const hexSelector = "[visGraphNodeE2eTestId='node-Hex']"
      const tooltipSelector =
        "[visGraphNodeTooltipE2eTestId='graph-node-tooltip']"

      cy.checkTooltip(emptySelector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('not.contain.text', 'This is a hex color')
        .invoke('text')
        .then((t) => expect(t.trim()).to.eq(''))
      cy.get(emptySelector).first().trigger('mouseout')

      cy.checkTooltip(hexSelector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('contain.text', 'This is a hex color')
      cy.get(hexSelector).first().trigger('mouseout')

      cy.checkTooltip(emptySelector)
      cy.get(tooltipSelector)
        .should('be.visible')
        .and('not.contain.text', 'This is a hex color')
        .invoke('text')
        .then((t) => expect(t.trim()).to.eq(''))
      cy.get(emptySelector).first().trigger('mouseout')
    })
  })

  describe(
    'Leaflet Map Component Tooltips',
    {
      viewportWidth: 1800,
    },
    () => {
      before(() => {
        cy.intercept(
          'GET',
          'https://demotiles.maplibre.org/tiles/tiles.json'
        ).as('tilesJson')
        cy.intercept(
          {
            method: 'GET',
            url: /^https:\/\/demotiles\.maplibre\.org\/tiles\/(\d+)\/(\d+)\/(\d+)\.pbf(?:\?.*)?$/,
            middleware: true,
          },
          (req) => {
            req.continue()
          }
        ).as('tile')
        cy.visit('/examples/Leaflet/Color%20Map')
        cy.wait(['@tilesJson', '@tile'])
        cy.wait(1000)
      })

      it('should show empty tooltip for point with empty string description (ap-0)', () => {
        const selector = "[visLeafletPointE2eTestId='leaflet-point-ap-0']"
        cy.checkTooltip(selector)
        cy.get("[visLeafletMapTooltipE2eTestId='leaflet-map-tooltip']")
          .should('be.visible')
          .and('contain.text', '')
        cy.percySnapshot('Leaflet Map Tooltip - Empty String', {
          widths: [1800],
        })
      })

      it('should show normal tooltip for point with maintenance mode description (ap-2)', () => {
        const selector = "[visLeafletPointE2eTestId='leaflet-point-ap-2']"
        cy.checkTooltip(selector)
        cy.get("[visLeafletMapTooltipE2eTestId='leaflet-map-tooltip']")
          .should('be.visible')
          .and('contain.text', 'Maintenance mode')
        cy.percySnapshot('Leaflet Map Tooltip - Maintenance Mode', {
          widths: [1800],
        })
      })

      it('should show empty tooltip for point with undefined description (ap-3)', () => {
        const selector = "[visLeafletPointE2eTestId='leaflet-point-ap-3']"
        cy.checkTooltip(selector)
        cy.get("[visLeafletMapTooltipE2eTestId='leaflet-map-tooltip']")
          .should('be.visible')
          .and('contain.text', '')
        cy.percySnapshot('Leaflet Map Tooltip - Undefined Empty Tooltip', {
          widths: [1800],
        })
      })

      it('should not show tooltip for point with null description (ap-4)', () => {
        const selector = "[visLeafletPointE2eTestId='leaflet-point-ap-4']"
        cy.checkTooltip(selector)
        cy.get("[visLeafletMapTooltipE2eTestId='leaflet-map-tooltip']").should(
          'not.be.visible'
        )
        cy.percySnapshot('Leaflet Map Tooltip - Null No Tooltip', {
          widths: [1800],
        })
      })

      it('should show tooltip sequence: empty string point (ap-0) -> maintenance mode point (ap-2) -> empty string point (ap-0)', () => {
        const emptySelector = "[visLeafletPointE2eTestId='leaflet-point-ap-0']"
        const maintenanceSelector =
          "[visLeafletPointE2eTestId='leaflet-point-ap-2']"
        const tooltipSelector =
          "[visLeafletMapTooltipE2eTestId='leaflet-map-tooltip']"

        cy.checkTooltip(emptySelector)
        cy.get(tooltipSelector)
          .should('be.visible')
          .and('not.contain.text', 'Maintenance mode')
          .invoke('text')
          .then((t) => expect(t.trim()).to.eq(''))
        cy.get('body').click(0, 0)

        cy.checkTooltip(maintenanceSelector)
        cy.get(tooltipSelector)
          .should('be.visible')
          .and('contain.text', 'Maintenance mode')
        cy.get('body').click(0, 0)

        cy.checkTooltip(emptySelector)
        cy.get(tooltipSelector)
          .should('be.visible')
          .and('not.contain.text', 'Maintenance mode')
          .invoke('text')
          .then((t) => expect(t.trim()).to.eq(''))
        cy.get('body').click(0, 0)

        cy.percySnapshot(
          'Leaflet Map Tooltip - Sequence Empty Maintenance Empty',
          { widths: [1800] }
        )
      })
    }
  )
})
