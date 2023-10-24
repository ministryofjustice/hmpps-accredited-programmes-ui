import { CourseUtils, ReferralUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation, Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter, CoursePresenter } from '@accredited-programmes/ui'

export default class CheckAnswersPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  participations: Array<CourseParticipationPresenter>

  person: Person

  referral: Referral

  username: Express.User['username']

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    participations: Array<CourseParticipationPresenter>
    person: Person
    referral: Referral
    username: Express.User['username']
  }) {
    super('Check your answers')

    const { course, courseOffering, organisation, participations, person, referral, username } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.participations = participations
    this.person = person
    this.referral = referral
    this.username = username
  }

  confirmDetailsAndSubmitReferral(referral: Referral) {
    cy.get('[name="confirmation"]').check()
    cy.task('stubReferral', { ...referral, status: 'referral_submitted' })
    this.shouldContainButton('Submit referral').click()
  }

  shouldHaveAdditionalInformation(referral: Referral): void {
    this.shouldContainLink('Change additional information', `/refer/new/referrals/${referral.id}/reason`)
    cy.get('[data-testid="additional-information"]').should('have.text', referral.reason)
  }

  shouldHaveApplicationSummary() {
    cy.get('[data-testid="application-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ReferralUtils.applicationSummaryListRows(
          this.courseOffering,
          this.course,
          this.organisation,
          this.person,
          this.username,
        ),
        summaryListElement,
      )
    })
  }

  shouldHaveConfirmationCheckbox() {
    this.shouldContainCheckbox(
      'confirmation',
      'I confirm the information I have provided is complete, accurate and up to date.',
    )
  }

  shouldHaveOasysConfirmation(): void {
    cy.get('[data-testid="oasys-confirmation"]').should('have.text', 'I confirm that the information is up to date.')
  }

  shouldHaveProgrammeHistory(): void {
    cy.get('[data-testid="programme-history"]').within(() => {
      this.shouldContainHistorySummaryCards(this.participations, this.referral.id, { change: true, remove: false })
    })
  }

  shouldNotHaveProgrammeHistory(): void {
    cy.get('[data-testid="programme-history"] .govuk-body').should(
      'have.text',
      `There is no record of Accredited Programmes for ${this.person.name}.`,
    )
  }
}
