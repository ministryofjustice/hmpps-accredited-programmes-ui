import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Person } from '@accredited-programmes/models'

export default class NewReferralFindPersonPage extends Page {
  constructor() {
    super("Enter the person's identifier", {
      pageTitleOverride: "Enter person's details",
    })
  }

  searchForPerson(prisonNumber: Person['prisonNumber']) {
    cy.get('input#prisonNumber').type(prisonNumber)

    this.shouldContainButton('Continue').click()
  }

  shouldContainIdentifierForm() {
    cy.get('form').within(() => {
      cy.contains('.govuk-label', "Enter a prison number. We'll import the person's details into the referral.").should(
        'have.attr',
        'for',
        'prisonNumber',
      )

      cy.get('.govuk-hint').then(hintElement => {
        const { actual, expected } = Helpers.parseHtml(hintElement, 'For example, a prison number is A1234AA')
        expect(actual).to.equal(expected)
      })

      cy.get('.govuk-input').should('have.attr', 'name', 'prisonNumber')
    })

    this.shouldContainButton('Continue')
  }
}
