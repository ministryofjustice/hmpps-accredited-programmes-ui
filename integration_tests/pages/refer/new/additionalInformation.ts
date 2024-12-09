import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { Referral } from '@accredited-programmes-api'

export default class NewReferralAdditionalInformationPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Add additional information')

    const { person, referral } = args

    this.person = person
    this.referral = referral
  }

  shouldContainAdditionalInformationTextArea() {
    this.shouldContainTextArea('additionalInformation', 'Provide additional information')
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainEnteredAdditionalInformation(additionalInformation: string) {
    cy.get('[data-testid="additional-information-text-area"]').should('have.text', additionalInformation)
  }

  shouldContainInstructions() {
    cy.get('[data-testid="instructions-paragraph"]').should(
      'have.text',
      'You must provide additional information you feel will help the programme team in their assessment. This might include:',
    )

    const expectedListText = [
      'the reason for the referral',
      "the person's motivation to complete a programme",
      'information to support an override',
    ]

    cy.get('.govuk-list li').each((listItemElement, listItemElementIndex) => {
      cy.wrap(listItemElement).should('have.text', expectedListText[listItemElementIndex])
    })
  }

  submitAdditionalInformation(additionalInformation = 'Wheat gluten makes great fake chicken') {
    cy.get('[data-testid="additional-information-text-area"]').type(additionalInformation, { delay: 0 })
    this.referral = { ...this.referral, additionalInformation }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
  }
}
