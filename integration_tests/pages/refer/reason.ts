import Page from '../page'
import type { Referral } from '@accredited-programmes/models'

export default class ReasonPage extends Page {
  referral: Referral

  constructor(args: { referral: Referral }) {
    super('Add reason for referral and supporting information')

    const { referral } = args

    this.referral = referral
  }

  shouldContainInformationTypeDetails() {
    cy.get('[data-testid="information-type-details"]').then(informationTypeDetailsElement => {
      this.shouldContainDetails(
        'What type of information can I add?',
        "you can provide information about why you're referring this person to this programme" +
          'you can add supporting information that would be useful for the programme team to know' +
          'you can add any other information that would be useful for the programme team to know',
        informationTypeDetailsElement,
      )
    })
  }

  shouldContainReasonTextArea() {
    this.shouldContainTextArea('reason', 'Add reason for referral and supporting information')
  }

  shouldContainSaveAndContinueButton() {
    this.shouldContainButton('Save and continue')
  }

  submitReason() {
    const reason = 'This is the reason for the referral'
    cy.get('[data-testid="reason-text-area"]').type(reason)
    this.referral = { ...this.referral, reason }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Save and continue').click()
  }
}
