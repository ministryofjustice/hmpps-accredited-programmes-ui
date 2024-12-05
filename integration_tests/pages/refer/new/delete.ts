import { referralFactory, referralViewFactory } from '../../../../server/testutils/factories'
import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { Referral } from '@accredited-programmes-api'

export default class NewReferralTaskListPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Delete draft referral?')

    const { person, referral } = args
    this.person = person
    this.referral = referral
  }

  shouldDeleteSuccessfully() {
    const draftReferral = referralFactory.build({ status: 'referral_started' })
    const draftReferralViews = [referralViewFactory.build({ id: draftReferral.id, status: draftReferral.status })]

    cy.task('stubDeleteReferral', this.referral.id)
    cy.task('stubReferral', draftReferral)
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'draft' } },
      referralViews: draftReferralViews,
      totalElements: draftReferralViews.length,
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'open' } },
      referralViews: [],
      totalElements: 0,
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'closed' } },
      referralViews: [],
      totalElements: 0,
    })

    this.shouldContainButton('Delete draft').click()
    this.shouldContainNotificationBanner(
      'Draft deleted',
      `<p class="govuk-notification-banner__heading">
        Draft referral for ${this.person.name} deleted.
      </p>`,
    )
  }
}
