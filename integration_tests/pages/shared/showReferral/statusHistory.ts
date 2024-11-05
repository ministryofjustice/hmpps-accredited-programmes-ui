import { CourseUtils, ShowReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class StatusHistoryPage extends Page {
  constructor(args: { course: Course }) {
    const { course } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)
  }

  shouldContainStatusHistoryTimeline(statusHistoryPresenter: Array<ReferralStatusHistoryPresenter>) {
    cy.get('[data-testid="status-history-timeline"]').then(timelineElement => {
      this.shouldContainTimelineItems(
        ShowReferralUtils.statusHistoryTimelineItems(statusHistoryPresenter),
        timelineElement,
      )
    })
  }
}
