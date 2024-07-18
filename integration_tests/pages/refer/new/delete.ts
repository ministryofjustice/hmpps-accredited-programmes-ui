import { referralFactory, referralViewFactory } from '../../../../server/testutils/factories'
import Page from '../../page'
import type { Person, Referral } from '@accredited-programmes/models'

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
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'open' } },
      referralViews: [],
    })
    cy.task('stubFindMyReferralViews', {
      queryParameters: { statusGroup: { equalTo: 'closed' } },
      referralViews: [],
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
