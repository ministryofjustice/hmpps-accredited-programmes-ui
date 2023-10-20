import Page from '../page'
import type { Person, Referral } from '@accredited-programmes/models'

export default class ConfirmOasysPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Confirm the OASys information')

    const { person, referral } = args
    this.person = person
    this.referral = referral
  }

  confirmOasys() {
    cy.get('[name="oasysConfirmed"]').check()
    this.referral = { ...this.referral, oasysConfirmed: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Save and continue').click()
  }

  shouldContainConfirmationCheckbox() {
    this.shouldContainCheckbox('oasysConfirmed', 'I confirm that the OASys information is up to date.')
  }

  shouldContainOasysAccessParagraph() {
    cy.get('[data-testid="oasys-access-paragraph"]').should(
      'have.text',
      'The programme team will need to access the full OASys Layer 3 to assess this referral.',
    )
  }

  shouldContainSaveAndContinueButton() {
    this.shouldContainButton('Save and continue')
  }
}
