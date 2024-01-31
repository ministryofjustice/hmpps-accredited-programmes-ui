import { CourseUtils, HealthUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, Health } from '@accredited-programmes/api'

export default class HealthPage extends Page {
  health: Health

  constructor(args: { course: Course; health: Health }) {
    const { course, health } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.health = health
  }

  shouldContainHealthSummaryList() {
    cy.get('[data-testid="health-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(HealthUtils.healthSummaryListRows(this.health), summaryListElement)
    })
  }

  shouldContainNoHealthDataSummaryCard() {
    cy.get('[data-testid="no-health-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 13 - Health',
        'No health data found in OASys. Add health data to OASys to see it here.',
        summaryCardElement,
      )
    })
  }
}
