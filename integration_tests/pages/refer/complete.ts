import Helpers from '../../support/helpers'
import Page from '../page'

export default class CompletePage extends Page {
  constructor() {
    super('Referral complete')
  }

  shouldContainFeedbackLink() {
    cy.get('[data-testid="feedback-paragraph"]').within(() => {
      cy.get('.govuk-link')
        .should('have.text', 'What did you think of this service?')
        .should(
          'have.attr',
          'href',
          'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2E8JCpI91GZDsQ5Hyq26MrZUQVQ5VFBIU0tKMUlZTDhLNUpZR01CQ0U5Uy4u',
        )
    })
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
