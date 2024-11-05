import { CourseUtils, ShowReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { CourseOffering, Organisation, Person, Referral } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'
import type { User } from '@manage-users-api'

export default class NewReferralDuplicatePage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  person: Person

  referral: Referral

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    person: Person
    referral: Referral
  }) {
    super('Duplicate referral found')

    const { course, courseOffering, organisation, person, referral } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.person = person
    this.referral = referral
  }

  shouldContainCourseOfferingSummaryList() {
    cy.get('[data-testid="course-offering-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ShowReferralUtils.courseOfferingSummaryListRows(
          this.person.name,
          this.course,
          this.courseOffering.contactEmail,
          this.organisation.name,
        ),
        summaryListElement,
      )
    })
  }

  shouldContainReferralExistsText() {
    cy.get('[data-testid="referral-exists-text"]').should(
      'have.text',
      `A referral already exists for ${this.person.name} to ${this.course.displayName} at ${this.organisation.name}.`,
    )
  }

  shouldContainSubmissionSummaryList(referrerName: User['name'], referrerEmail: CourseOffering['contactEmail']): void {
    cy.get('[data-testid="submission-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ShowReferralUtils.submissionSummaryListRows(this.referral.submittedOn, referrerName, referrerEmail),
        summaryListElement,
      )
    })
  }
}
