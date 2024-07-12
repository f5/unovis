describe('Unovis Test', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Load homepage', () => {
    cy.percySnapshot('Homepage test')
  })

  it('Basic Annotation', () => {
    cy.contains('Basic Annotations').click()
    cy.wait(3000)
    cy.percySnapshot('Basic Annotation', { scope: '.exampleViewer' })
  })

  it('Single Container', () => {
    cy.contains('Single Container').click()
    cy.wait(3000)
    cy.percySnapshot('Single Container', { scope: '.exampleViewer' })
  })

  it('Bullet Shapes', () => {
    cy.contains('Bullet Shapes').click()
    cy.wait(3000)
    cy.percySnapshot('Bullet Shapes', { scope: '.exampleViewer' })
  })

  // it('Basic Bullet Legend', () => {
  //   cy.contains('Basic Bullet Legend').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Bullet Legend', { scope: '.exampleViewer' })
  // })

  // it('Line Legend', () => {
  //   cy.contains('Line Legend').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Line Legend', { scope: '.exampleViewer' })
  // })

  // it('Shape Legend', () => {
  //   cy.contains('Shape Legend').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Shape Legend', { scope: '.exampleViewer' })
  // })

  // it('Vertical Legend', () => {
  //   cy.contains('Vertical Legend').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Vertical Legend', { scope: '.exampleViewer' })
  // })

  // it('Scrollable Container Comparison', () => {
  //   cy.contains('Scrollable Container Comparison').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Scrollable Container Comparison', { scope: '.exampleViewer' })
  // })

  // it('Light and Dark Theme', () => {
  //   cy.contains('Light and Dark Theme').click()
  //   cy.wait(6000)
  //   cy.percySnapshot('Light and Dark Theme', { scope: '.exampleViewer' })
  // })

  // it('Raster Leaflet Map', () => {
  //   cy.contains('Raster Leaflet Map').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Raster Leaflet Map', { scope: '.exampleViewer' })
  // })

  // it('Vector Map', () => {
  //   cy.contains('Vector Map').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Vector Map', { scope: '.exampleViewer' })
  // })

  // it('Donut: Empty Segments', () => {
  //   cy.contains('Donut: Empty Segments').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Donut: Empty Segments', { scope: '.exampleViewer' })
  // })

  // it('Donut Data Transitions', () => {
  //   cy.contains('Donut Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Donut Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('Basic Nested Donut', () => {
  //   cy.contains('Basic Nested Donut').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Nested Donut', { scope: '.exampleViewer' })
  // })

  // it('Nested Donut Data Transitions', () => {
  //   cy.contains('Nested Donut Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Nested Donut Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('Interactive Nested Donut', () => {
  //   cy.contains('Interactive Nested Donut').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Interactive Nested Donut', { scope: '.exampleViewer' })
  // })

  // it('Segment labels', () => {
  //   cy.contains('Segment labels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Segment labels', { scope: '.exampleViewer' })
  // })

  // it('Nested Donut Layer Configuration', () => {
  //   cy.contains('Nested Donut Layer Configuration').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Nested Donut Layer Configurationt', { scope: '.exampleViewer' })
  // })

  // it('Segment values', () => {
  //   cy.contains('Segment values').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Segment values', { scope: '.exampleViewer' })
  // })

  // it('Empty Segments', () => {
  //   cy.contains('Empty Segments').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Empty Segments', { scope: '.exampleViewer' })
  // })

  // it('Chrod Diagram Hierarchy Nodes', () => {
  //   cy.contains('Chrod Diagram Hierarchy Nodes').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Chrod Diagram Hierarchy Nodes', { scope: '.exampleViewer' })
  // })

  // it('Node Levels', () => {
  //   cy.contains('Node Levels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Node Levels', { scope: '.exampleViewer' })
  // })

  // it('Basic Chrod Diagram', () => {
  //   cy.contains('Basic Chrod Diagram').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Chrod Diagram', { scope: '.exampleViewer' })
  // })

  // it('Labels and Radius Scale Exponent', () => {
  //   cy.contains('Labels and Radius Scale Exponent').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Labels and Radius Scale Exponent', { scope: '.exampleViewer' })
  // })

  // it('Chrod Diagram Node Selection', () => {
  //   cy.contains('Chrod Diagram Node Selection').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Chrod Diagram Node Selection', { scope: '.exampleViewer' })
  // })

  // it('Graph: Custom Node Fills', () => {
  //   cy.contains('Graph: Custom Node Fills').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Graph: Custom Node Fills', { scope: '.exampleViewer' })
  // })

  // it('Graph: SVG Node Icons', () => {
  //   cy.contains('Graph: SVG Node Icons').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Graph: SVG Node Icons', { scope: '.exampleViewer' })
  // })

  // it('Dynamic Layout', () => {
  //   cy.contains('Dynamic Layout').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Dynamic Layout', { scope: '.exampleViewer' })
  // })

  // it('Layout: ELK', () => {
  //   cy.contains('Layout: ELK').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Layout: ELK', { scope: '.exampleViewer' })
  // })

  // it('Link Arrows', () => {
  //   cy.contains('Link Arrows').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Link Arrows', { scope: '.exampleViewer' })
  // })

  // it('Node and Link Circle Labels', () => {
  //   cy.contains('Node and Link Circle Labels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Node and Link Circle Labels', { scope: '.exampleViewer' })
  // })

  // it('Graph Brushing', () => {
  //   cy.contains('Graph Brushing').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Graph Brushing', { scope: '.exampleViewer' })
  // })

  // it('Node Labels and Sub-labels', () => {
  //   cy.contains('Node Labels and Sub-labels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Node Labels and Sub-labels', { scope: '.exampleViewer' })
  // })

  // it('Graph: Node Positions', () => {
  //   cy.contains('Graph: Node Positions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Graph: Node Positions', { scope: '.exampleViewer' })
  // })

  // it('Graph: Node Selection', () => {
  //   cy.contains('Graph: Node Selection').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Graph: Node Selection', { scope: '.exampleViewer' })
  // })

  // it('Sankey Data Transitions', () => {
  //   cy.contains('Sankey Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Sankey Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('API Endpoints Tree', () => {
  //   cy.contains('API Endpoints Tree').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('API Endpoints Tree', { scope: '.exampleViewer', widths: [1300], minHeight: 2400 })
  // })

  // it('Area Chart with Baseline', () => {
  //   cy.contains('Area Chart with Baseline').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Area Chart with Baseline', { scope: '.exampleViewer' })
  // })

  // it('Basic Area Chart', () => {
  //   cy.contains('Basic Area Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Area Chart', { scope: '.exampleViewer' })
  // })

  // it('Area Data Transitions', () => {
  //   cy.contains('Area Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Area Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('Axis with Ticks Rotation', () => {
  //   cy.contains('Axis with Ticks Rotation').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Axis with Ticks Rotation', { scope: '.exampleViewer' })
  // })

  // it('Axis', () => {
  //   cy.contains('Axis').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Axis', { scope: '.exampleViewer' })
  // })

  // it('Custom Style Brush', () => {
  //   cy.contains('Custom Style Brush').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Custom Style Brush', { scope: '.exampleViewer' })
  // })

  // it('Stacked vs. Non-Stacked', () => {
  //   cy.contains('Stacked vs. Non-Stacked').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Stacked vs. Non-Stacked', { scope: '.exampleViewer' })
  // })

  // it('Dual Axis Chart', () => {
  //   cy.contains('Dual Axis Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Dual Axis Chart', { scope: '.exampleViewer' })
  // })

  // it('Basic Grouped Bar Chart', () => {
  //   cy.contains('Basic Grouped Bar Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Grouped Bar Chart', { scope: '.exampleViewer' })
  // })

  // it('Grouped Bar Chart', () => {
  //   cy.contains('Grouped Bar Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Grouped Bar Chart', { scope: '.exampleViewer' })
  // })

  // it('Multi Line Chart', () => {
  //   cy.contains('Multi Line Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Multi Line Chart', { scope: '.exampleViewer' })
  // })

  // it('Points with labels', () => {
  //   cy.contains('Points with labels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Points with labels', { scope: '.exampleViewer' })
  // })

  // it('Points with stroke', () => {
  //   cy.contains('Points with stroke').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Points with stroke', { scope: '.exampleViewer' })
  // })

  // it('Scatter with Line', () => {
  //   cy.contains('Scatter with Line').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Scatter with Line', { scope: '.exampleViewer' })
  // })

  // it('Basic Stacked Bar Chart', () => {
  //   cy.contains('Basic Stacked Bar Chart').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Basic Stacked Bar Chart', { scope: '.exampleViewer' })
  // })

  // it('Stacked Bar Data Transitions', () => {
  //   cy.contains('Stacked Bar Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Stacked Bar Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('Timeline Data Transitions', () => {
  //   cy.contains('Timeline Data Transitions').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Timeline Data Transitions', { scope: '.exampleViewer' })
  // })

  // it('Timeline: Negative Lengths', () => {
  //   cy.contains('Timeline: Negative Lengths').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Timeline: Negative Lengths', { scope: '.exampleViewer' })
  // })

  // it('Tooltip and Scrolling', () => {
  //   cy.contains('Tooltip and Scrolling').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Tooltip and Scrolling', { scope: '.exampleViewer' })
  // })

  // it('Scale by Domain', () => {
  //   cy.contains('Scale by Domain').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Scale by Domain', { scope: '.exampleViewer' })
  // })

  // it('Stacked Bar with Labels', () => {
  //   cy.contains('Stacked Bar with Labels').click()
  //   cy.wait(3000)
  //   cy.percySnapshot('Stacked Bar with Labels', { scope: '.exampleViewer' })
  // })
})

