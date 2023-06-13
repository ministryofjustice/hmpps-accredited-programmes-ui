import presentCourse from '../../../server/utils/courseUtils'
import { presentOrganisationWithOfferingEmail } from '../../../server/utils/organisationUtils'
import Page from '../page'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingEmailPresenter } from '@accredited-programmes/ui'

export default class CourseOfferingPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: OrganisationWithOfferingEmailPresenter

  constructor(args: { courseOffering: CourseOffering; course: Course; organisation: Organisation }) {
    const { courseOffering, organisation, course } = args
    super(course.name, `${course.name}, ${organisation.name}`)
    this.courseOffering = courseOffering
    this.course = presentCourse(course)
    this.organisation = presentOrganisationWithOfferingEmail(organisation, courseOffering.contactEmail)
  }

  shouldHaveAudience() {
    cy.get('p:first-of-type').then(tagContainerElement => {
      this.shouldContainTags(this.course.audienceTags, tagContainerElement)
    })
  }

  shouldHaveOrganisationWithOfferingEmail() {
    cy.get('h2').should('have.text', this.organisation.name)

    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(this.organisation.summaryListRows, summaryListElement)
    })

    cy.get('.govuk-button').then(buttonLinkElement => {
      this.shouldContainButtonLink('Make referral', `mailto:${this.courseOffering.contactEmail}`, buttonLinkElement)
    })
  }
}
