import { findPaths } from '../../../server/paths'
import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course } from '@accredited-programmes-api'

export default class CoursesPage extends Page {
  constructor() {
    super('Find an Accredited Programme')
  }

  shouldContainAddNewProgrammeLink() {
    cy.get('[data-testid="add-programme-link"]')
      .should('contain.text', 'Add a new programme')
      .and('have.attr', 'href', findPaths.course.add.show({}))
  }

  shouldHaveCourses(courses: Array<Course>) {
    cy.get('div[role=listitem]').each((courseElement, courseElementIndex) => {
      cy.wrap(courseElement).within(() => {
        const course = CourseUtils.presentCourse(courses[courseElementIndex])

        cy.get('.govuk-link').should('have.attr', 'href', findPaths.show({ courseId: course.id }))
        cy.get('.govuk-heading-m .govuk-link').should('have.text', course.displayName)

        cy.get('.govuk-tag').then(tagElement => {
          this.shouldContainTag(course.audienceTag, tagElement)
        })

        cy.get('p:nth-of-type(2)').should('have.text', course.description)

        cy.get('.govuk-summary-list').then(summaryListElement => {
          this.shouldContainSummaryListRows(course.prerequisiteSummaryListRows, summaryListElement)
        })
      })
    })
  }

  shouldNotContainAddNewProgrammeLink() {
    cy.get('[data-testid="add-programme-link"]').should('not.exist')
  }
}
