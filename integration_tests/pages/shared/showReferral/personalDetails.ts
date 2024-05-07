import { CourseUtils, PersonUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person } from '@accredited-programmes/models'

export default class PersonalDetailsPage extends Page {
  person: Person

  constructor(args: { course: Course; person: Person }) {
    const { course, person } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.person = person
  }

  shouldContainPersonalDetailsSummaryCard(): void {
    cy.get('[data-testid="personal-details-summary-card"]').then(summaryCardElement => {
      this.shouldContainSummaryCard(
        'Personal details',
        [],
        PersonUtils.summaryListRows(this.person),
        summaryCardElement,
      )
    })
  }
}
