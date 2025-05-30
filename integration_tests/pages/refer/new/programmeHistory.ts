import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { Referral } from '@accredited-programmes-api'

export default class NewReferralProgrammeHistoryPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Accredited Programme history', {
      hideTitleServiceName: true,
      pageTitleOverride: "Person's Accredited Programme history",
    })

    const { person, referral } = args
    this.person = person
    this.referral = referral
  }

  reviewProgrammeHistory() {
    this.referral = { ...this.referral, hasReviewedProgrammeHistory: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Return to tasklist').click()
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
      `This is a list of programmes ${this.person.name} has started or completed. You can add missing programme history.`,
    )
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
