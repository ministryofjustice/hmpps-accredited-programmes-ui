import presentCourse from '../../../server/utils/courseUtils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'

export default class CoursesPage extends Page {
  constructor() {
    super('List of accredited programmes', 'Programmes')
  }

  shouldHaveCourses(courses: Array<Course>) {
    cy.get('div[role=listitem]').each((courseElement, courseElementIndex) => {
      cy.wrap(courseElement).within(() => {
        const course = presentCourse(courses[courseElementIndex])

        cy.get('h2').should('have.text', course.name)

        cy.get('p:first-of-type').then(tagContainerElement => {
          this.shouldContainTags(course.audienceTags, tagContainerElement)
        })

        cy.get('p:nth-of-type(2)').should('not.have.text', course.description)

        cy.get('.govuk-summary-list').then(summaryListElement => {
          this.shouldContainSummaryListRows(course.prerequisiteSummaryListRows, summaryListElement)
        })
      })
    })
  }
}
