import { referPaths } from '../../../server/paths'
import { personUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Person } from '@accredited-programmes/models'

export default class ConfirmPersonPage extends Page {
  course: Course

  courseOffering: CourseOffering

  person: Person

  constructor(args: { course: Course; courseOffering: CourseOffering; person: Person }) {
    const { course, courseOffering, person } = args

    super(`Confirm ${person.name}'s details`, { customPageTitleEnd: 'Confirm personal details' })

    this.course = course
    this.courseOffering = courseOffering
    this.person = person
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainDifferentIdentifierLink() {
    this.shouldContainLink(
      'Enter a different identifier',
      referPaths.new({ courseId: this.course.id, courseOfferingId: this.courseOffering.id }),
    )
  }

  shouldHavePersonInformation() {
    cy.get('.govuk-summary-list').then(summaryListElement => {
      this.shouldContainSummaryListRows(personUtils.summaryListRows(this.person), summaryListElement)
    })

    cy.get('.govuk-warning-text__text').should(
      'contain.text',
      'If this information is out of date or incorrect, you must update the information in NOMIS.',
    )
  }
}
