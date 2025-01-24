import Page from '../page'
import type { Prisoner } from '@prisoner-search'

export default class PersonSearchPage extends Page {
  constructor() {
    super('Find recommended programmes', { hideTitleServiceName: false })
  }

  searchForPerson(prisonerNumber: Prisoner['prisonerNumber']) {
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
