import { findPaths } from '../../../server/paths'
import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'

export default class CoursesPage extends Page {
  constructor() {
    super('List of accredited programmes')
  }

  shouldHaveCourses(courses: Array<Course>) {
    cy.get('div[role=listitem]').each((courseElement, courseElementIndex) => {
      cy.wrap(courseElement).within(() => {
        const course = CourseUtils.presentCourse(courses[courseElementIndex])

        cy.get('.govuk-link').should('have.attr', 'href', findPaths.show({ courseId: course.id }))
        cy.get('.govuk-heading-m .govuk-link').should('have.text', course.nameAndAlternateName)

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
}
