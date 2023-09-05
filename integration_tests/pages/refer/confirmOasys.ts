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

  shouldContainImportanceDetails() {
    cy.get('[data-testid="importance-details"]').then(importanceDetailsElement => {
      this.shouldContainDetails(
        'Why is this important?',
        "A referral to an Accredited Programme requires up to date information about someone's risk, need, and responsivity. The information in OASys will be shared with the programme team to assess this referral. The information includes risk scores, screenings, and health information. If the information is out of date or incomplete, this will delay your referral.",
        importanceDetailsElement,
      )
    })
  }

  shouldContainLastUpdatedNotificationBanner() {
    cy.get('[data-testid="last-updated-notification-banner"]').then(lastUpdatedNotificationBanner => {
      this.shouldContainNotificationBanner(
        "Del Hatton's OASys was last updated on 23 January 2022 by Chanelle Duffy. If you believe anything has changed since this date, you must update OASys.",
        lastUpdatedNotificationBanner,
      )
    })
  }

  shouldContainSaveAndContinueButton() {
    this.shouldContainButton('Save and continue')
  }
}
