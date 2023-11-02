import { referPaths } from '../../../../server/paths'
import { CourseUtils, ReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, CourseOffering, Organisation, Person, Referral } from '@accredited-programmes/models'
import type { CourseParticipationPresenter, CoursePresenter } from '@accredited-programmes/ui'

export default class NewReferralCheckAnswersPage extends Page {
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

    cy.get('[name="confirmation"]').check()
    this.shouldContainButton('Submit referral').click()
  }

  shouldHaveAdditionalInformation(): void {
    this.shouldContainLink(
      'Change additional information',
      referPaths.new.additionalInformation.show({ referralId: this.referral.id }),
    )
    cy.get('[data-testid="additional-information"]').should('have.text', this.referral.additionalInformation)
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
      `There is no Accredited Programme history for ${this.person.name}.`,
    )
  }
}
