import Page from '../../page'
import type { Person, Referral } from '@accredited-programmes/models'

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

  shouldContainInstructions() {
    cy.get('[data-testid="instructions-paragraph"]').should(
      'have.text',
      'You must provide additional information you feel will help the programme team in their assessment. This might include:',
    )

    const expectedListText = [
      'The reason for the referral',
      "The person's motivation to complete a programme",
      'Information to support an override',
    ]

    cy.get('.govuk-list li').each((listItemElement, listItemElementIndex) => {
      cy.wrap(listItemElement).should('have.text', expectedListText[listItemElementIndex])
    })
  }

  shouldContainSaveAndContinueButton() {
    this.shouldContainButton('Save and continue')
  }

  submitAdditionalInformation() {
    const additionalInformation = 'Wheat gluten makes great fake chicken'
    cy.get('[data-testid="additional-information-text-area"]').type(additionalInformation)
    this.referral = { ...this.referral, additionalInformation }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Save and continue').click()
  }
}
