import { referPaths } from '../../../server/paths'
import { courseUtils, organisationUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingEmailsPresenter } from '@accredited-programmes/ui'

export default class CourseOfferingPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: OrganisationWithOfferingEmailsPresenter

  constructor(args: { courseOffering: CourseOffering; course: Course; organisation: Organisation }) {
    const { courseOffering, organisation, course } = args
    const coursePresenter = courseUtils.presentCourse(course)

    super(coursePresenter.nameAndAlternateName, {
      customPageTitleEnd: `${coursePresenter.nameAndAlternateName}, ${organisation.name}`,
    })

    this.courseOffering = courseOffering
    this.course = coursePresenter
    this.organisation = organisationUtils.presentOrganisationWithOfferingEmails(
      organisation,
      courseOffering,
      course.name,
    )
  }

  shouldContainMakeAReferralButtonLink() {
    this.shouldContainButtonLink(
      'Make a referral',
      referPaths.start({ courseId: this.course.id, courseOfferingId: this.courseOffering.id }),
    )
  }

  shouldHaveOrganisationWithOfferingEmails() {
    cy.get('.govuk-heading-m').should('have.text', this.organisation.name)

    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(this.organisation.summaryListRows, summaryListElement)
    })
  }

  shouldNotContainMakeAReferralButtonLink() {
    this.shouldNotContainButtonLink()
  }

  shouldNotContainSecondaryContactEmailSummaryListItem() {
    cy.get('.govuk-summary-list').should('not.contain', 'Secondary email address')
  }
}
