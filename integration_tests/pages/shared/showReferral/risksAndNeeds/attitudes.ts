import { AttitudesUtils, CourseUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Attitude, Course } from '@accredited-programmes-api'

export default class AttitudesPage extends Page {
  attitude: Attitude

  constructor(args: { attitude: Attitude; course: Course }) {
    const { attitude, course } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.attitude = attitude
  }

  shouldContainAttitudesSummaryList() {
    cy.get('[data-testid="attitudes-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(AttitudesUtils.attitudesSummaryListRows(this.attitude), summaryListElement)
    })
  }

  shouldContainNoAttitudeDataSummaryCard() {
    cy.get('[data-testid="no-attitude-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 12 - Attitudes',
        'No attitude data found in OASys. Add attitude data to OASys to see it here.',
        summaryCardElement,
      )
    })
  }
}
