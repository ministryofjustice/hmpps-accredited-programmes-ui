import { CourseUtils, RoshAnalysisUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { RoshAnalysis } from '@accredited-programmes/models'
import type { Course } from '@accredited-programmes-api'

export default class RoshAnalysisPage extends Page {
  roshAnalysis: RoshAnalysis

  constructor(args: { course: Course; roshAnalysis: RoshAnalysis }) {
    const { course, roshAnalysis } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`, {
      hideTitleServiceName: true,
      pageTitleOverride: `Risks and needs for referral to ${coursePresenter.displayName}`,
    })

    this.roshAnalysis = roshAnalysis
  }

  shouldContainNoRoshAnalysisSummaryCard() {
    cy.get('[data-testid="no-rosh-analysis-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section R6 - RoSH analysis',
        'No RoSH analysis found in OASys. Add RoSH analysis to OASys to see it here.',
        summaryCardElement,
      )
    })
  }

  shouldContainPreviousBehaviourSummaryList() {
    cy.get('[data-testid="previous-behaviour-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RoshAnalysisUtils.previousBehaviourSummaryListRows(this.roshAnalysis),
        summaryListElement,
      )
    })
  }
}
