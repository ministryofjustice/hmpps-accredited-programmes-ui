import Page from '../page'
import type { CourseParticipationWithName, Person, Referral } from '@accredited-programmes/models'

export default class ProgrammeHistoryPage extends Page {
  participations: Array<CourseParticipationWithName>

  person: Person

  referral: Referral

  constructor(args: {
    participationsWithNames: Array<CourseParticipationWithName>
    person: Person
    referral: Referral
  }) {
    super('Accredited Programme history')

    const { participationsWithNames, person, referral } = args
    this.participations = participationsWithNames
    this.person = person
    this.referral = referral
  }

  reviewProgrammeHistory() {
    this.referral = { ...this.referral, hasReviewedProgrammeHistory: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
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

  shouldContainSuccessMessage(message: string) {
    cy.get('[data-testid="success-banner"]').should('contain.text', message)
  }

  shouldNotContainSuccessMessage() {
    cy.get('[data-testid="success-banner"]').should('not.exist')
  }
}
