import { referPaths } from '../../../../server/paths'
import Helpers from '../../../support/helpers'
import Page from '../../page'

export default class NewReferralCompletePage extends Page {
  constructor() {
    super('Referral complete')
  }

  shouldContainFeedbackLink() {
    cy.get('[data-testid="feedback-paragraph"]').within(() => {
      cy.get('.govuk-link')
        .should('have.text', 'What did you think of this service?')
        .should('have.attr', 'href', 'https://www.smartsurvey.co.uk/s/UWK3UY/')
    })
  }

  shouldContainMyReferralsLink() {
    this.shouldContainButtonLink('Go to my referrals', referPaths.caseList.index({}))
  }

  shouldHaveProcessInformation() {
    cy.get('[data-testid="process-information-heading"]').should('have.text', 'What happens next')

    const processInformationParagraphsText = [
      'Your referral has been sent to the programme team for evaluation.',
      'The programme team might need to do further assessments to find out if a person is suitable or not.',
      "If a person is suitable, they'll get added to a waiting list.",
      'If you have any questions about your referral, contact the programme office.',
    ]

    processInformationParagraphsText.forEach((text, textIndex) => {
      cy.get(`[data-testid="process-information-paragraph-${textIndex + 1}"]`).then(paragraphElement => {
        const { actual, expected } = Helpers.parseHtml(paragraphElement, text)
        expect(actual).to.equal(expected)
      })
    })
  }
}
