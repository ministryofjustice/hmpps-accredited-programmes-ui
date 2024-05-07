import { CourseUtils, ThinkingAndBehavingUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Behaviour, Course } from '@accredited-programmes/models'

export default class ThinkingAndBehavingPage extends Page {
  behaviour: Behaviour

  constructor(args: { behaviour: Behaviour; course: Course }) {
    const { behaviour, course } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.behaviour = behaviour
  }

  shouldContainNoBehaviourDataSummaryCard() {
    cy.get('[data-testid="no-behaviour-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 11 - Thinking and behaving',
        'No behaviour data found in OASys. Add behaviour data to OASys to see it here.',
        summaryCardElement,
      )
    })
  }

  shouldContainThinkingAndBehavingSummaryList() {
    cy.get('[data-testid="thinking-and-behaving-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        ThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows(this.behaviour),
        summaryListElement,
      )
    })
  }
}
