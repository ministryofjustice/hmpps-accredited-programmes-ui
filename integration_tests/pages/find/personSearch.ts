import Page from '../page'
import type { PeopleSearchResponse } from '@accredited-programmes-api'

export default class PersonSearchPage extends Page {
  constructor() {
    super('Find recommended programmes', { hideTitleServiceName: false })
  }

  searchForPerson(prisonerNumber: PeopleSearchResponse['prisonerNumber']) {
    cy.get('input[id="prisonNumber"]').type(prisonerNumber)

    this.shouldContainButton('Continue').click()
  }

  shouldContainPersonSearchInput() {
    this.shouldContainTextInput(
      'prisonNumber',
      "Enter a prison number to check what programmes are recommended based on the person's risks and needs.",
    )
  }
}
