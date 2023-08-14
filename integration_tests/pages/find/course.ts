import { findPaths } from '../../../server/paths'
import { courseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'
import type { CoursePresenter, OrganisationWithOfferingId } from '@accredited-programmes/ui'

export default class CoursePage extends Page {
  course: CoursePresenter

  constructor(course: Course) {
    const coursePresenter = courseUtils.presentCourse(course)

    super(coursePresenter.nameAndAlternateName)

    this.course = coursePresenter
  }

  shouldHaveCourse() {
    this.shouldContainAudienceTags(this.course.audienceTags)

    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(this.course.prerequisiteSummaryListRows, summaryListElement)
    })

    cy.get('p:nth-of-type(2)').should('have.text', this.course.description)
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
          cy.get('.govuk-table__cell:nth-of-type(2)').should('have.text', organisation.category)
          cy.get('.govuk-table__cell:nth-of-type(3)').should('have.text', organisation.address.county || 'Not found')
          cy.get('.govuk-table__cell:nth-of-type(4)').should('have.text', `Contact prison (${organisation.name})`)
          cy.get('.govuk-table__cell:nth-of-type(4) .govuk-link').should(
            'have.attr',
            'href',
            findPaths.offerings.show({
              courseId: this.course.id,
              courseOfferingId: organisation.courseOfferingId,
            }),
          )
        })
      })
    })
  }
}
