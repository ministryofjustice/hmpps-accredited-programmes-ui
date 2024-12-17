import { findPaths } from '../../../server/paths'
import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { CoursePresenter, OrganisationWithOfferingId } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class CoursePage extends Page {
  course: CoursePresenter

  constructor(course: Course) {
    const coursePresenter = CourseUtils.presentCourse(course)

    super(coursePresenter.displayName || coursePresenter.name)

    this.course = coursePresenter
  }

  shouldContainAddCourseOfferingLink() {
    cy.get('[data-testid="add-programme-offering-link"]')
      .should('contain.text', 'Add a new location')
      .and('have.attr', 'href', findPaths.offerings.add.show({ courseId: this.course.id }))
  }

  shouldContainNoOfferingsText() {
    cy.get('[data-testid="no-offerings-text"]').should('have.text', CourseUtils.noOfferingsMessage(this.course.name))
  }

  shouldContainOfferingsText() {
    cy.get('[data-testid="offerings-text"]').should(
      'have.text',
      'Select a prison to contact the programme team or make a referral.',
    )
  }

  shouldContainUpdateProgrammeLink() {
    cy.get('[data-testid="update-programme-link"]')
      .should('contain.text', 'Update programme')
      .and('have.attr', 'href', findPaths.course.update.show({ courseId: this.course.id }))
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
            findPaths.offerings.show({ courseOfferingId: organisation.courseOfferingId as string }),
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

  shouldNotContainUpdateProgrammeLink() {
    cy.get('[data-testid="update-programme-link"]').should('not.exist')
  }
}
