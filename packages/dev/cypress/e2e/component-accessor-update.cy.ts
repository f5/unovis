// Regression test: a component-level config change has to repaint on its own.
//
// In this example the selection reaches `VisHeatmap` through React context, so
// `VisSingleContainer`'s own props stay equal across the update and it never re-renders. That used to
// mean the component's `setConfig()` stored the new `color` accessor and nothing ever painted it —
// the chart kept showing the previous selection's colors until some unrelated interaction happened.
// The component wrapper now asks its container to render, so the repaint no longer depends on the
// container noticing a children diff.

const selections = [
  { label: 'A', color: 'rgb(233, 71, 60)', column: 0 },
  { label: 'B', color: 'rgb(58, 123, 232)', column: 1 },
  { label: 'C', color: 'rgb(238, 174, 39)', column: 2 },
]

const dimmed = 'rgb(217, 220, 225)'
const numRows = 7

/** Asserts that exactly the selected column is filled with the selection's color. */
function expectPainted (selection: typeof selections[number]): void {
  for (let row = 0; row < numRows; row += 1) {
    cy.get(`[visHeatmapCellE2eTestId="cell-r${row}-c${selection.column}"]`)
      .should('have.css', 'fill', selection.color)
  }

  // And that no other selection's color is on the canvas — a stale repaint would leave one behind.
  cy.get('[visHeatmapCellE2eTestId]').then($cells => {
    const unexpected = Array.from($cells)
      .map(cell => cell.style.fill)
      .filter(fill => fill !== dimmed && fill !== selection.color)
    expect(unexpected, `only ${selection.label}'s color should be painted`).to.deep.eq([])
  })
}

describe('Component accessor update', () => {
  before(() => {
    cy.visit('/examples/Heatmap/Heatmap%20Accessor%20Update', { qs: { duration: 0 } })
    cy.get('[visHeatmapCellE2eTestId]').should('have.length', numRows * 10)
  })

  it('paints the initial selection', () => {
    expectPainted(selections[0])
  })

  // `testIsolation: false`, so these run as one sequence against the same chart. Each step asserts the
  // previous selection is still on screen first — otherwise a chart stuck on the very first paint would
  // satisfy any step that happens to cycle back to it.
  const sequence = [selections[1], selections[2], selections[0], selections[1]]

  sequence.forEach((selection, i) => {
    const previous = i === 0 ? selections[0] : sequence[i - 1]

    it(`repaints when the color accessor changes from ${previous.label} to ${selection.label}`, () => {
      expectPainted(previous)
      cy.get(`[data-testid="select-${selection.label}"]`).click()
      expectPainted(selection)
      // The previous selection must be gone, not merely overdrawn.
      cy.get(`[visHeatmapCellE2eTestId="cell-r0-c${previous.column}"]`)
        .should('have.css', 'fill', dimmed)
    })
  })
})
