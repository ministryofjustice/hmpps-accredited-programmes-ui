import Page from '../page'
import type { Person, Referral } from '@accredited-programmes/models'

export default class ReasonPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Add additional information')

    const { person, referral } = args

    this.person = person
    this.referral = referral
  }

  shouldContainInstructions() {
    cy.get('#reason-hint .govuk-body').should(
      'have.text',
      'You can provide any additional information you feel will help the programme team in their assessment. This might include:',
    )

    const expectedListText = [
      'The reason for the referral',
      "The person's motivation to complete a programme",
      'Their offence history and behaviour',
      'Information to support an override',
    ]

    cy.get('.govuk-list li').each((listItemElement, listItemElementIndex) => {
      cy.wrap(listItemElement).should('have.text', expectedListText[listItemElementIndex])
    })
  }

  shouldContainReasonTextArea() {
    this.shouldContainTextArea('reason', 'Add additional information')
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
