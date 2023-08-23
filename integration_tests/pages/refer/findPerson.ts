import Helpers from '../../support/helpers'
import Page from '../page'
import type { Person } from '@accredited-programmes/models'

export default class FindPersonPage extends Page {
  constructor() {
    super("Enter the person's identifier")
  }

  searchForPerson(prisonNumber: Person['prisonNumber']) {
    cy.get('input#prisonNumber').type(prisonNumber)

    this.shouldContainButton('Continue').click()
  }

  shouldContainIdentifierForm() {
    cy.get('form').within(() => {
      cy.contains('.govuk-label', 'Enter identifier').should('have.attr', 'for', 'prisonNumber')

      cy.get('.govuk-hint').then(hintElement => {
        const { actual, expected } = Helpers.parseHtml(hintElement, 'For example, a prison number is DO16821')
        expect(actual).to.equal(expected)
      })

      cy.get('.govuk-input').should('have.attr', 'name', 'prisonNumber')
    })

    this.shouldContainButton('Continue')
  }

  shouldContainInstructionsParagraph() {
    cy.get('.govuk-main-wrapper .govuk-body').should(
      'have.text',
      "Enter the prison number. We'll import their details into your application.",
    )
  }
}
