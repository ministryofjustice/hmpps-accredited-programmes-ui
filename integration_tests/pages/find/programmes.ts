import type { AccreditedProgramme } from '@accredited-programmes/models'
import Page from '../page'

export default class ProgrammesPage extends Page {
  constructor() {
    super('List of accredited programmes')
  }

  shouldHaveProgrammes(programmes: Array<AccreditedProgramme>) {
    cy.get('li').each((programmeElement, programmeElementIndex) => {
      cy.wrap(programmeElement)
        .invoke('text')
        .then(text => text.trim())
        .should('equal', programmes[programmeElementIndex].name)
    })
  }
}
