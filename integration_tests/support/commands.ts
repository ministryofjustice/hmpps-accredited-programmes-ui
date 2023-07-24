import type { Result } from 'axe-core'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task<string>('getSignInUrl').then((url: string) => cy.visit(url, options))
})

const logAccessibilityViolations = (violations: Result[]) => {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${
      violations.length === 1 ? 'was' : 'were'
    } detected`,
  )

  const violationsData = violations.map(({ id, impact, description, nodes }) => ({
    id,
    impact,
    description,
    nodes: nodes.length,
  }))

  cy.task('table', violationsData)
}

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe()
  cy.configureAxe({ rules: [{ id: 'region', selector: '.govuk-phase-banner', enabled: false }] })
  cy.checkA11y(undefined, undefined, logAccessibilityViolations)
})
