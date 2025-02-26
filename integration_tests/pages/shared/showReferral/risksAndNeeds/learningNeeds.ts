import { CourseUtils, LearningNeedsUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, LearningNeeds } from '@accredited-programmes-api'

export default class LearningNeedsPage extends Page {
  learningNeeds: LearningNeeds

  constructor(args: { course: Course; learningNeeds: LearningNeeds }) {
    const { course, learningNeeds } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`, {
      hideTitleServiceName: true,
      pageTitleOverride: `Risks and needs for referral to ${coursePresenter.displayName}`,
    })

    this.learningNeeds = learningNeeds
  }

  shouldContainInformationSummaryList() {
    cy.get('[data-testid="information-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        LearningNeedsUtils.informationSummaryListRows(this.learningNeeds),
        summaryListElement,
      )
    })
  }

  shouldContainNoLearningNeedsDataSummaryCard() {
    cy.get('[data-testid="no-learning-needs-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Learning needs',
        'No learning needs data found in OASys. Add learning needs data to OASys to see them here.',
        summaryCardElement,
      )
    })
  }

  shouldContainScoreSummaryList() {
    cy.get('[data-testid="score-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(LearningNeedsUtils.scoreSummaryListRows(this.learningNeeds), summaryListElement)
    })
  }
}
