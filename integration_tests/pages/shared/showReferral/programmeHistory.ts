import { CourseUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person } from '@accredited-programmes/models'

export default class ProgrammeHistoryPage extends Page {
  person: Person

  constructor(args: { course: Course; person: Person }) {
    const { course, person } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.person = person
  }

  shouldContainNoHistorySummaryCard() {
    cy.get('[data-testid="no-programme-history-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Accredited Programme history',
        `There is no Accredited Programme history for ${this.person.name}.`,
        summaryCardElement,
      )
    })
  }
}
