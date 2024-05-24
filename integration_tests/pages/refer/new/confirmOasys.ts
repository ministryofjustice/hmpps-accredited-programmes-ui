import Page from '../../page'
import type { Person, Referral } from '@accredited-programmes/models'

export default class NewReferralConfirmOasysPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Confirm the OASys information')

    const { person, referral } = args
    this.person = person
    this.referral = referral
  }

  confirmOasys() {
    this.selectCheckbox('oasysConfirmed')
    this.referral = { ...this.referral, oasysConfirmed: true }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
  }

  shouldContainConfirmationCheckbox() {
    this.shouldContainCheckbox('oasysConfirmed', 'I confirm that the OASys information is up to date.')
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainOasysAccessParagraph() {
    cy.get('[data-testid="oasys-access-paragraph"]').should(
      'have.text',
      'The programme team will need to access the full OASys Layer 3 to assess this referral.',
    )
  }
}
