import { referPaths } from '../../../server/paths'
import { CourseUtils, OrganisationUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingEmailsPresenter } from '@accredited-programmes/ui'

export default class CourseOfferingPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: OrganisationWithOfferingEmailsPresenter

  constructor(args: { course: Course; courseOffering: CourseOffering; organisation: Organisation }) {
    const { courseOffering, organisation, course } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(coursePresenter.nameAndAlternateName, {
      customPageTitleEnd: `${coursePresenter.nameAndAlternateName}, ${organisation.name}`,
    })

    this.courseOffering = courseOffering
    this.course = coursePresenter
    this.organisation = OrganisationUtils.presentOrganisationWithOfferingEmails(
      organisation,
      courseOffering,
      course.name,
    )
  }

  shouldContainMakeAReferralButtonLink() {
    this.shouldContainButtonLink('Make a referral', referPaths.start({ courseOfferingId: this.courseOffering.id }))
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
