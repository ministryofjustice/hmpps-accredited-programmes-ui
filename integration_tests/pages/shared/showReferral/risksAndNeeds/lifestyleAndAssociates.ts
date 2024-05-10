import { CourseUtils, LifestyleAndAssociatesUtils, ShowRisksAndNeedsUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, Lifestyle } from '@accredited-programmes/models'

export default class LifestyleAndAssociatesPage extends Page {
  lifestyle: Lifestyle

  constructor(args: { course: Course; lifestyle: Lifestyle }) {
    const { course, lifestyle } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.lifestyle = lifestyle
  }

  shouldContainLifestyleIssuesSummaryCard() {
    cy.get('[data-testid="lifestyle-issues-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Lifestyle issues affecting risk of offending or harm',
        ShowRisksAndNeedsUtils.textValue(this.lifestyle.lifestyleIssues),
        summaryCardElement,
      )
    })
  }

  shouldContainNoLifestyleDataSummaryCard() {
    cy.get('[data-testid="no-lifestyle-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 7 - Lifestyle and associates',
        'No lifestyle data found in OASys. Add lifestyle data to OASys to see them here.',
        summaryCardElement,
      )
    })
  }

  shouldContainReoffendingSummaryList() {
    cy.get('[data-testid="reoffending-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        LifestyleAndAssociatesUtils.reoffendingSummaryListRows(this.lifestyle),
        summaryListElement,
      )
    })
  }
}
