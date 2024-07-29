import { findPaths } from '../../../server/paths'
import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingId } from '@accredited-programmes/ui'

export default class CoursePage extends Page {
  course: CoursePresenter

  constructor(course: Course) {
    const coursePresenter = CourseUtils.presentCourse(course)

    super(coursePresenter.displayName)

    this.course = coursePresenter
  }

  shouldContainAddCourseOfferingLink() {
    cy.get('[data-testid="add-programme-offering-link"]')
      .should('contain.text', 'Add a new location')
      .and('have.attr', 'href', findPaths.offerings.add.show({ courseId: this.course.id }))
  }

  shouldContainNoOfferingsText() {
    cy.get('[data-testid="no-offerings-text"]').should(
      'have.text',
      `To find out where ${this.course.displayName} is offered, speak to your Offender Management Unit (custody) or regional probation team (community).`,
    )
  }

  shouldContainOfferingsText() {
    cy.get('[data-testid="offerings-text"]').should(
      'have.text',
      'Select a prison to contact the programme team or make a referral. Online referrals are not yet available at all sites.',
    )
  }

  shouldHaveCourse() {
    this.shouldContainAudienceTag(this.course.audienceTag)

    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(this.course.prerequisiteSummaryListRows, summaryListElement)
    })

    cy.get('[data-testid="description-paragraph"]').should('have.text', this.course.description)
  }

  shouldHaveOrganisations(organisationsWithOfferingIds: Array<OrganisationWithOfferingId>) {
    const sortedOrganisations = organisationsWithOfferingIds.sort((organisationA, organisationB) =>
      organisationA.name.localeCompare(organisationB.name),
    )

    cy.get('.govuk-table__body').within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const organisation = sortedOrganisations[tableRowElementIndex]

        cy.wrap(tableRowElement).within(() => {
          cy.get('.govuk-table__cell:first-of-type').should('have.text', organisation.name)
          cy.get('.govuk-table__cell:first-of-type a').should(
            'have.attr',
            'href',
            findPaths.offerings.show({ courseOfferingId: organisation.courseOfferingId }),
          )
          cy.get('.govuk-table__cell:nth-of-type(2)').should('have.text', organisation.category)
          cy.get('.govuk-table__cell:nth-of-type(3)').should('have.text', organisation.address.county || 'Not found')
        })
      })
    })
  }

  shouldNotContainAddCourseOfferingLink() {
    cy.get('[data-testid="add-programme-offering-link"]').should('not.exist')
  }
}
