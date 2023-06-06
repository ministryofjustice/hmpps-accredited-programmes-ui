import paths from '../../../server/paths/find'
import presentCourse from '../../../server/utils/courseUtils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'
import type { Prison } from '@prison-api'

export default class CoursePage extends Page {
  course: CoursePresenter

  constructor(course: Course) {
    super(course.name, course.name)
    this.course = presentCourse(course)
  }

  shouldHaveCourse() {
    cy.get('.govuk-grid-column-two-thirds').within(() => {
      cy.get('p:first-of-type').then(tagContainerElement => {
        this.shouldContainTags(this.course.audienceTags, tagContainerElement)
      })

      cy.get('.govuk-summary-list').then(summaryListElement => {
        this.shouldContainSummaryListRows(this.course.prerequisiteSummaryListRows, summaryListElement)
      })

      cy.get('p:nth-of-type(2)').should('have.text', this.course.description)
    })
  }

  shouldHavePrisons(prisons: Array<Prison>) {
    const sortedPrisons = prisons.sort((prisonA, prisonB) => prisonA.premise.localeCompare(prisonB.premise))

    cy.get('.govuk-table__body').within(() => {
      cy.get('.govuk-table__row').each((tableRowElement, tableRowElementIndex) => {
        const prison = sortedPrisons[tableRowElementIndex]
        const primaryAddress = prison.addresses.find(address => address.primary)

        cy.wrap(tableRowElement).within(() => {
          cy.get('.govuk-table__cell:first-of-type').should('have.text', prison.premise)
          cy.get('.govuk-table__cell:nth-of-type(2)').should('have.text', 'N/A')
          cy.get('.govuk-table__cell:nth-of-type(3)').should('have.text', primaryAddress.locality || 'Not found')
          cy.get('.govuk-table__cell:nth-of-type(4)').should('have.text', `Contact prison (${prison.premise})`)
          cy.get('.govuk-table__cell:nth-of-type(4) a').should(
            'have.attr',
            'href',
            paths.courseOffering.show({ id: this.course.id, organisationId: prison.agencyId }),
          )
        })
      })
    })
  }
}
