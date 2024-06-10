import { CourseUtils, EmotionalWellbeingUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, Psychiatric } from '@accredited-programmes/models'

export default class EmotionalWellbeing extends Page {
  psychiatric: Psychiatric

  constructor(args: { course: Course; psychiatric: Psychiatric }) {
    const { course, psychiatric } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.psychiatric = psychiatric
  }

  shouldContainNoPsychiatricDataSummaryCard() {
    cy.get('[data-testid="no-psychiatric-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 10 - Emotional wellbeing',
        'No psychiatric data found in OASys. Add psychiatric data to OASys to see them here.',
        summaryCardElement,
      )
    })
  }

  shouldContainPsychiatricProblemsSummaryList() {
    cy.get('[data-testid="psychiatric-problems-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        EmotionalWellbeingUtils.psychiatricSummaryListRows(this.psychiatric),
        summaryListElement,
      )
    })
  }
}
