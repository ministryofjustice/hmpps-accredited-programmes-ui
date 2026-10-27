import { findPaths, referPaths } from '../../../server/paths'
import { CourseUtils, OrganisationUtils } from '../../../server/utils'
import Page from '../page'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingEmailsPresenter } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class CourseOfferingPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: OrganisationWithOfferingEmailsPresenter

  constructor(args: { course: Course; courseOffering: CourseOffering; organisation: Organisation }) {
    const { courseOffering, organisation, course } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(coursePresenter.displayName || coursePresenter.name, {
      hideTitleServiceName: true,
      pageTitleOverride: `${coursePresenter.displayName} programme at ${organisation.name}`,
    })

    this.courseOffering = courseOffering
    this.course = coursePresenter
    this.organisation = OrganisationUtils.presentOrganisationWithOfferingEmails(
      organisation,
      courseOffering,
      course.name,
    )
  }

  shouldContainDeleteOfferingButton() {
    cy.get('[data-testid="delete-programme-offering-button"]').should('contain.text', 'Delete')
  }

  shouldContainMakeAReferralButtonLink() {
    return this.shouldContainButtonLink(
      'Make a referral',
      referPaths.new.start({ courseOfferingId: this.courseOffering.id }),
    )
  }

  shouldContainUpdateCourseOfferingLink() {
    cy.get('[data-testid="update-programme-offering-link"]')
      .should('contain.text', 'Update')
      .and('have.attr', 'href', findPaths.offerings.update.show({ courseOfferingId: this.courseOffering.id }))
  }

  shouldHaveOrganisationWithOfferingEmails() {
    cy.get('.govuk-heading-m').should('have.text', this.organisation.name)

    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(this.organisation.summaryListRows, summaryListElement)
    })
  }

  shouldNotContainDeleteOfferingButton() {
    cy.get('[data-testid="delete-programme-offering-button"]').should('not.exist')
  }

  shouldNotContainMakeAReferralButtonLink() {
    cy.get('[data-testid="make-referral-link"]').should('not.exist')
  }

  shouldNotContainSecondaryContactEmailSummaryListItem() {
    cy.get('.govuk-summary-list').should('not.contain', 'Secondary email address')
  }

  shouldNotContainUpdateCourseOfferingLink() {
    cy.get('[data-testid="update-programme-offering-link"]').should('not.exist')
  }
}
