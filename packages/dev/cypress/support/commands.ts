/// <reference types="cypress" />

export function checkTooltip (selector: string): void {
  cy.get(selector).first()
    .should('exist')
    .scrollIntoView()
    .should('be.visible')
    .then($el => {
      const r = $el[0].getBoundingClientRect()
      cy.wrap($el)
        .trigger('mousemove', {
          clientX: r.x + r.width / 2,
          clientY: r.y + r.height / 2,
          force: true,
        })
        .trigger('mouseover', { force: true })
    })
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkTooltip: typeof checkTooltip;
    }
  }
}

Cypress.Commands.add('checkTooltip', checkTooltip)

export default {
  checkTooltip,
}
