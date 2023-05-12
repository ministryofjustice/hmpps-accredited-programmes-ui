import type { AccreditedProgramme } from '@accredited-programmes/models'
import Page from '../page'
import { prerequisiteSummaryListRows } from '../../../server/utils/programmeUtils'

export default class ProgrammesPage extends Page {
  constructor() {
    super('List of accredited programmes')
  }

  shouldHaveProgrammes(programmes: Array<AccreditedProgramme>) {
    cy.get('div[role=listitem]').each((programmeElement, programmeElementIndex) => {
      cy.wrap(programmeElement).within(() => {
        const programme = programmes[programmeElementIndex]

        cy.get('h2').should('have.text', programme.name)

        // TODO: update the following once API/model is updated
        const hardcodedTags = ['SEXUAL OFFENCE', 'EXTREMISM', 'INTIMATE PARTNER VIOLENCE', 'GENERAL VIOLENCE']

        cy.get('.govuk-tag').each((tagElement, tagElementIndex) => {
          cy.wrap(tagElement).then(wrappedTagElement => {
            const { actual, expected } = this.parseHtml(wrappedTagElement, hardcodedTags[tagElementIndex])
            expect(actual).to.equal(expected)
          })
        })

        cy.get('p:nth-of-type(2)').should('have.text', programme.description)

        const rows = prerequisiteSummaryListRows(programme.programmePrerequisites)

        cy.get('.govuk-summary-list').then(summaryListElement => {
          this.shouldContainSummaryListRows(rows, summaryListElement)
        })
      })
    })
  }
}
