import { urls } from '../urls'
const scopeSelector = '.exampleViewer'

describe('Unovis Test', () => {
  it('Load homepage', () => {
    cy.visit('/')
    cy.percySnapshot('Homepage test')
  })

  urls.forEach((test) => {
    it(test.title, () => {
      cy.visit(test.url, {
        qs: {
          duration: test.duration,
        },
      })
      cy.wait(test.duration > 100 ? test.duration : 100)
      cy.percySnapshot(test.title, { scope: scopeSelector })
    })
  })
})

