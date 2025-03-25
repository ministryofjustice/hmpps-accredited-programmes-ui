import { courseFactory, courseOfferingFactory, referralViewFactory } from '../../../server/testutils/factories'
import { StringUtils } from '../../../server/utils'
import Page from '../page'
import type { Person } from '@accredited-programmes/models'
import type { Referral } from '@accredited-programmes-api'

export default class UpdateLdcPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    const { person, referral } = args

    super('Update Learning disabilities and challenges (LDC)', {})

    this.person = person
    this.referral = referral
  }

  shouldContainHasLdcContent() {
    this.shouldContainText(
      `${StringUtils.makePossessive(this.person.name)} current LDC status: May need an LDC-adapted programme`,
    )

    cy.get('[data-testid="target-status-heading"]').should(
      'contain.text',
      'Update status: Does not need an LDC-adapted programme',
    )

    cy.get('[data-testid="ldc-reason-fieldset"] legend').should(
      'contain.text',
      `You must give a reason why ${this.person.name} does not need an LDC-adapted programme.`,
    )

    this.shouldContainCheckboxItems([
      {
        text: 'The Adaptive Functioning Checklist (AFCR) suggested that they are not suitable for LDC programmes.',
        value: 'afcrSuggestion',
      },
      { text: 'Their learning screening tool scores have changed.', value: 'scoresChanged' },
      { text: "The What works for me meeting found that they didn't need an LDC programme.", value: 'whatWorksForMe' },
    ])
  }

  shouldContainNoLdcContent() {
    this.shouldContainText(
      `${StringUtils.makePossessive(this.person.name)} current LDC status: Does not need an LDC-adapted programme`,
    )

    cy.get('[data-testid="target-status-heading"]').should(
      'contain.text',
      'Update status: May need an LDC-adapted programme',
    )

    cy.get('[data-testid="ldc-reason-fieldset"] legend').should(
      'contain.text',
      `You must give a reason why ${this.person.name} may need an LDC-adapted programme.`,
    )

    this.shouldContainCheckboxItems([
      {
        text: 'The Adaptive Functioning Checklist (AFCR) suggested that they are suitable for LDC programmes.',
        value: 'afcrSuggestion',
      },
      { text: 'Their learning screening tool scores have changed.', value: 'scoresChanged' },
      {
        text: 'The What works for me meeting found that they were suitable for LDC programmes.',
        value: 'whatWorksForMe',
      },
    ])
  }

  shouldUpdateLdcSuccessfully() {
    const course = courseFactory.build({
      courseOfferings: [courseOfferingFactory.build({ id: this.referral.offeringId })],
    })
    const courseReferralViews = [referralViewFactory.build({ id: this.referral.id, status: this.referral.status })]

    // Stubs for submitting LDC update
    cy.task('stubCourseByOffering', { course, courseOfferingId: this.referral.offeringId })
    cy.task('stubUpdateReferral', this.referral.id)

    // Stubs for loading Case List page
    cy.task('stubCoursesForOrganisation', { courses: [course], organisationId: 'MRI' })
    cy.task('stubCourseAudiences', { audiences: [], courseId: course.id })
    cy.task('stubReferralStatuses', [])
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: {
        courseName: { equalTo: course.name },
        statusGroup: { equalTo: 'open' },
      },
      referralViews: courseReferralViews,
      totalElements: courseReferralViews.length,
    })
    cy.task('stubFindReferralViews', {
      organisationId: 'MRI',
      queryParameters: {
        courseName: { equalTo: course.name },
        statusGroup: { equalTo: 'closed' },
      },
      referralViews: [],
      totalElements: 0,
    })

    this.shouldContainButton('Submit').click()
    this.shouldContainNotificationBanner(
      'Success',
      `<h3 class="govuk-notification-banner__heading">LDC status changed</h3>
       <p class="govuk-body">Update: ${this.person.name} may ${this.referral.hasLdc ? 'not ' : ''}need an LDC-adapted programme</p>`,
    )
  }
}
