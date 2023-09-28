import type { AxeRules } from '@accredited-programmes/integration-tests'
import type { Result } from 'axe-core'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task<string>('getSignInUrl').then((url: string) => cy.visit(url, options))
})

const logAccessibilityViolations = (violations: Array<Result>) => {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${
      violations.length === 1 ? 'was' : 'were'
    } detected`,
  )

  const violationsData = violations.map(({ id, impact, description, nodes }) => ({
    description,
    id,
    impact,
    nodes: nodes.length,
  }))

  cy.task('table', violationsData)
}

Cypress.Commands.add('checkAccessibility', (rules: AxeRules = undefined) => {
  cy.injectAxe()
  cy.configureAxe({ rules: [{ enabled: false, id: 'region', selector: '.govuk-phase-banner' }] })
  cy.checkA11y(undefined, { rules }, logAccessibilityViolations)
})
