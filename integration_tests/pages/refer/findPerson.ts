import helpers from '../../support/helpers'
import Page from '../page'

export default class FindPersonPage extends Page {
  constructor() {
    super("Enter the person's identifier")
  }

  shouldContainIdentifierForm() {
    cy.get('form').within(() => {
      cy.contains('.govuk-label', 'Enter identifier').should('have.attr', 'for', 'prisonNumber')

      cy.get('.govuk-hint').then(hintElement => {
        const { actual, expected } = helpers.parseHtml(hintElement, 'For example, a prison number is DO16821')
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
