import { CourseParticipationUtils } from '../../../server/utils'
import Page from '../page'
import type { CourseParticipationWithName, Person } from '@accredited-programmes/models'

export default class ProgrammeHistoryPage extends Page {
  participations: Array<CourseParticipationWithName>

  person: Person

  constructor(args: { participationsWithNames: Array<CourseParticipationWithName>; person: Person }) {
    super('Accredited Programme history')

    const { participationsWithNames, person } = args
    this.participations = participationsWithNames
    this.person = person
  }

  shouldContainHistorySummaryCards() {
    this.participations.forEach((participation, participationsIndex) => {
      const { rows } = CourseParticipationUtils.summaryListOptions(participation)
      cy.get('.govuk-summary-card')
        .eq(participationsIndex)
        .then(summaryCardElement => {
          this.shouldContainSummaryCard(participation.name, rows, summaryCardElement)
        })
    })
  }

  shouldContainNoHistoryHeading() {
    cy.get('[data-testid="no-history-heading"]').should(
      'have.text',
      `There is no record of Accredited Programmes for ${this.person.name}.`,
    )
  }

  shouldContainNoHistoryParagraph() {
    cy.get('[data-testid="no-history-paragraph"]').should(
      'have.text',
      `The programme team may use information about a person's Accredited Programme history to assess whether they are suitable. You can add a programme to this history or continue with the referral if the ${this.person.name}'s history is unknown.`,
    )
  }

  shouldContainPreHistoryParagraph() {
    cy.get('[data-testid="pre-history-paragraph"]').should(
      'have.text',
      `The history below shows ${this.person.name}'s history of Accredited Programmes. Add another programme if you know that they started or completed a programme which is not listed below.`,
    )
  }
}
