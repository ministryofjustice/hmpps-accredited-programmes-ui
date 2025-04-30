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
    cy.get('[data-testid="add-info-instructions-paragraph-one"]').should(
      'have.text',
      'Relevant scores and information from OASys will automatically be pulled through to the referral.',
    )

    cy.get('[data-testid="add-info-instructions-paragraph-two"]').should(
      'have.text',
      'Give any other information relevant to the referral, such as:',
    )

    const expectedListText = ['the reason for the referral', "the person's motivation to complete a programme"]

    cy.get('.govuk-list li').each((listItemElement, listItemElementIndex) => {
      cy.wrap(listItemElement).should('have.text', expectedListText[listItemElementIndex])
    })
  }

  shouldContainOverrideReasonTextArea() {
    this.shouldContainTextArea('referrerOverrideReason', 'Reason for override')
  }

  shouldContainReferrerOverrideReason(referrerOverrideReason: string) {
    cy.get('[data-testid="additional-information-text-area""]').should('have.text', referrerOverrideReason)
  }

  skipAdditionalInformation() {
    this.referral = { ...this.referral, hasReviewedAdditionalInformation: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Skip this section').click()
  }

  submitAdditionalInformation(additionalInformation = 'Wheat gluten makes great fake chicken') {
    cy.get('[data-testid="additional-information-text-area"]').eq(0).type(additionalInformation, { delay: 0 })
    this.referral = { ...this.referral, additionalInformation, hasReviewedAdditionalInformation: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
  }

  submitOverrideReason(overrideReason = 'An Override reason') {
    cy.get('[data-testid="referrer-override-reason-text-area"]').eq(0).type(overrideReason, { delay: 100 })

    this.referral = {
      ...this.referral,
      hasReviewedAdditionalInformation: true,
      referrerOverrideReason: overrideReason,
    }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
  }
}
