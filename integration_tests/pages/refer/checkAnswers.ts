import { CourseUtils, ReferralUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class CheckAnswersPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  person: Person

  username: Express.User['username']

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    person: Person
    username: Express.User['username']
  }) {
    super('Check your answers')

    const { course, courseOffering, organisation, person, username } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.person = person
    this.username = username
  }

  confirmDetailsAndSubmitReferral() {
    cy.get('[name="confirmation"]').check()
    this.shouldContainButton('Submit referral').click()
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
}
