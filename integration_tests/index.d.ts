import type { AxeRules } from '@accredited-programmes/integration-tests'

declare global {
  namespace Cypress {
    interface Chainable {
      checkAccessibility(rules?: AxeRules): void
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>
    }
  }
}
