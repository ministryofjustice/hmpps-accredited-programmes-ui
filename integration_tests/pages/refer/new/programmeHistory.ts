import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

export default class NewReferralProgrammeHistoryPage extends Page {
  participations: Array<CourseParticipationPresenter>

  person: Person

  referral: Referral

  constructor(args: { participations: Array<CourseParticipationPresenter>; person: Person; referral: Referral }) {
    super('Accredited Programme history')

    const { participations, person, referral } = args
    this.participations = participations
    this.person = person
    this.referral = referral
  }

  reviewProgrammeHistory() {
    this.referral = { ...this.referral, hasReviewedProgrammeHistory: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Skip this section').click()
  }

  shouldContainNoHistoryParagraphs() {
    cy.get('[data-testid="no-history-paragraph-1"]').should(
      'have.text',
      "The programme team may use information about a person's Accredited Programme history to assess whether they are suitable.",
    )

    cy.get('[data-testid="no-history-paragraph-2"]').should(
      'have.text',
      'You can continue by adding a programme history or skip this section of the referral if the history is not known.',
    )
  }

  shouldContainNoHistoryText() {
    cy.get('[data-testid="history-text"]').then(historyTextElement => {
      const { actual, expected } = Helpers.parseHtml(
        historyTextElement,
        `There is no record of Accredited Programmes for ${this.person.name}.`,
      )
      expect(actual).to.equal(expected)
    })
  }

  shouldContainPreHistoryParagraph() {
    cy.get('[data-testid="pre-history-paragraph"]').should(
      'have.text',
      'Add another programme if you know that they started or completed a programme which is not listed below or skip this section of the referral if the history is not known.',
    )
  }

  shouldContainPreHistoryText() {
    cy.get('[data-testid="history-text"]').then(historyTextElement => {
      const { actual, expected } = Helpers.parseHtml(
        historyTextElement,
        `The history shows ${this.person.name} has previously started or completed an Accredited Programme.`,
      )
      expect(actual).to.equal(expected)
    })
  }

  shouldContainSuccessMessage(message: string) {
    cy.get('[data-testid="success-banner"]').then(successBannerElement => {
      const { actual, expected } = Helpers.parseHtml(successBannerElement, message)
      expect(actual).to.equal(expected)
    })
  }

  shouldNotContainNoHistoryParagraphs() {
    cy.get('[data-testid="no-history-paragraph"]').should('not.exist')
  }

  shouldNotContainPreHistoryParagraph() {
    cy.get('[data-testid="pre-history-paragraph"]').should('not.exist')
  }

  shouldNotContainSuccessMessage() {
    cy.get('[data-testid="success-banner"]').should('not.exist')
  }
}
