import { personUtils } from '../../../server/utils'
import Page from '../page'
import type { Person } from '@accredited-programmes/models'

export default class ConfirmPersonPage extends Page {
  person: Person

  constructor(person: Person) {
    super(`Confirm ${person.name}'s details`, { customPageTitleEnd: 'Confirm personal details' })

    this.person = person
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainDifferentIdentifierLink() {
    this.shouldContainLink('Enter a different identifier', '')
  }

  shouldHavePersonInformation() {
    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(personUtils.summaryListRows(this.person), summaryListElement)
    })

    cy.get('.govuk-warning-text__text').should(
      'contain.text',
      'If this information is out of date or incorrect, you must update the information in NOMIS.',
    )
  }
}
