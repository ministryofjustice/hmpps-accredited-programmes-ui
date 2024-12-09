import { referPaths } from '../../../../server/paths'
import { CourseUtils, NewReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type { CourseParticipationPresenter, CoursePresenter } from '@accredited-programmes/ui'
import type { Course, Referral } from '@accredited-programmes-api'
import type { User, UserEmail } from '@manage-users-api'

export default class NewReferralCheckAnswersPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  participations: Array<CourseParticipationPresenter>

  person: Person

  referral: Referral

  referrerEmail: UserEmail['email']

  referrerName: User['name']

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    participations: Array<CourseParticipationPresenter>
    person: Person
    referral: Referral
    referrerEmail: UserEmail['email']
    referrerName: User['name']
  }) {
    super('Check your answers')

    const { course, courseOffering, organisation, participations, person, referral, referrerEmail, referrerName } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.participations = participations
    this.person = person
    this.referral = referral
    this.referrerEmail = referrerEmail
    this.referrerName = referrerName
  }

  confirmDetailsAndSubmitReferral() {
    // Need to stub the call to get the referral twice because
    // the first stub is for the submit method and
    // the second stub is for the complete page
    cy.task('stubReferralWithScenario', {
      newScenarioState: 'Submitted',
      referral: this.referral,
      requiredScenarioState: 'Started',
      scenarioName: 'Submitting a referral',
    })
    cy.task('stubReferralWithScenario', {
      referral: { ...this.referral, status: 'referral_submitted' },
      requiredScenarioState: 'Submitted',
      scenarioName: 'Submitting a referral',
    })

    this.selectCheckbox('confirmation')
    this.shouldContainButton('Submit referral').click()
  }

  shouldHaveAdditionalInformation(): void {
    this.shouldContainLink(
      'Change additional information',
      referPaths.new.additionalInformation.show({ referralId: this.referral.id }),
    )

    cy.get('[data-testid="additional-information-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Add additional information',
        this.referral.additionalInformation as string,
        summaryCardElement,
      )
    })
  }

  shouldHaveConfirmationCheckbox() {
    this.shouldContainCheckbox(
      'confirmation',
      'I confirm the information I have provided is complete, accurate and up to date.',
    )
  }

  shouldHaveCourseOfferingSummary() {
    cy.get('[data-testid="course-offering-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        NewReferralUtils.courseOfferingSummaryListRows(
          this.courseOffering,
          this.course,
          this.organisation,
          this.person,
        ),
        summaryListElement,
      )
    })
  }

  shouldHaveOasysConfirmation(): void {
    cy.get('[data-testid="oasys-confirmation-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Confirm OASys information',
        'I confirm that the information is up to date.',
        summaryCardElement,
      )
    })
  }

  shouldHaveProgrammeHistory(): void {
    cy.get('[data-testid="programme-history"]').within(() => {
      this.shouldContainHistorySummaryCards(this.participations, this.referral.id, { change: true, remove: false })
    })
  }

  shouldHaveReferrerSummary(): void {
    cy.get('[data-testid="referrer-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        NewReferralUtils.referrerSummaryListRows(this.referrerName, this.referrerEmail),
        summaryListElement,
      )
    })
  }

  shouldNotHaveProgrammeHistory(): void {
    cy.get('[data-testid="programme-history"] .govuk-body').should(
      'have.text',
      `There is no Accredited Programme history for ${this.person.name}.`,
    )
  }
}
