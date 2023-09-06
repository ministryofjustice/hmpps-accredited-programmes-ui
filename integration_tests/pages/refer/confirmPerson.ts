import { referPaths } from '../../../server/paths'
import Page from '../page'
import type { Course, CourseOffering, Person } from '@accredited-programmes/models'

export default class ConfirmPersonPage extends Page {
  courseOffering: CourseOffering

  person: Person

  constructor(args: { course: Course; courseOffering: CourseOffering; person: Person }) {
    const { courseOffering, person } = args

    super(`Confirm ${person.name}'s details`, { customPageTitleEnd: 'Confirm personal details' })

    this.courseOffering = courseOffering
    this.person = person
  }

  confirmPerson() {
    this.shouldContainButton('Continue').click()
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainDifferentIdentifierLink() {
    this.shouldContainLink('Enter a different identifier', referPaths.new({ courseOfferingId: this.courseOffering.id }))
  }

  shouldHavePersonInformation() {
    this.shouldContainPersonSummaryList(this.person)

    cy.get('.govuk-warning-text__text').should(
      'contain.text',
      'If this information is out of date or incorrect, you must update the information in NOMIS.',
    )
  }
}
