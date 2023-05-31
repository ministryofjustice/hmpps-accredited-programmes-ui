import courseWithPrerequisiteSummaryListRows from '../../../server/utils/courseUtils'
import Page from '../page'
import type { Course } from '@accredited-programmes/models'

export default class CoursesPage extends Page {
  constructor() {
    super('List of accredited programmes', 'Programmes')
  }

  shouldHaveCourses(courses: Array<Course>) {
    cy.get('div[role=listitem]').each((courseElement, courseElementIndex) => {
      cy.wrap(courseElement).within(() => {
        const course = courseWithPrerequisiteSummaryListRows(courses[courseElementIndex])

        cy.get('h2').should('have.text', course.name)

        // TODO: update the following once API/model is updated
        const hardcodedTags = ['SEXUAL OFFENCE', 'EXTREMISM', 'INTIMATE PARTNER VIOLENCE', 'GENERAL VIOLENCE']

        cy.get('.govuk-tag').each((tagElement, tagElementIndex) => {
          cy.wrap(tagElement).then(wrappedTagElement => {
            const { actual, expected } = this.parseHtml(wrappedTagElement, hardcodedTags[tagElementIndex])
            expect(actual).to.equal(expected)
          })
        })

        cy.get('p:nth-of-type(2)').should('have.text', course.description)

        cy.get('.govuk-summary-list').then(summaryListElement => {
          this.shouldContainSummaryListRows(course.prerequisiteSummaryListRows, summaryListElement)
        })
      })
    })
  }
}
