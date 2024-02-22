import { CourseUtils, ShowReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course } from '@accredited-programmes/models'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

export default class StatusHistoryPage extends Page {
  constructor(args: { course: Course }) {
    const { course } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)
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
