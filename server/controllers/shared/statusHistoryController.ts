import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths, referPathBase, referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { Referral } from '@accredited-programmes-api'

export default class StatusHistoryController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      delete req.session.referralStatusUpdateData

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { updatePerson } = req.query as Record<string, string>
      const isRefer = req.path.startsWith(referPathBase.pattern)

      const referral = await this.referralService.getReferral(username, referralId, { updatePerson })

      const originalReferralData = await this.getOriginalReferralData(username, referral.originalReferralId, isRefer)

      const [course, statusHistory, person, statusTransitions] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.personService.getPerson(username, referral.prisonNumber),
        isRefer ? this.referralService.getStatusTransitions(username, referral.id) : undefined,
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

      return res.render('referrals/show/statusHistory/show', {
        buttons: ShowReferralUtils.buttons(
          { currentPath: req.path, recentCaseListPath: req.session.recentCaseListPath },
          referral,
          statusTransitions,
        ),
        hideTitleServiceName: true,
        pageHeading: `Referral to ${coursePresenter.displayName}`,
        pageSubHeading: 'Status history',
        pageTitleOverride: `Status history for referral to ${coursePresenter.displayName}`,
        person,
        referral,
        subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'statusHistory', referral.id),
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(
          statusHistory,
          originalReferralData?.href,
          originalReferralData?.course.name,
        ),
      })
    }
  }

  private async getOriginalReferralData(
    username: Express.User['username'],
    originalReferralId: Referral['id'] | undefined,
    isRefer: boolean,
  ) {
    if (!originalReferralId) {
      return undefined
    }

    const paths = isRefer ? referPaths : assessPaths
    const originalReferral = await this.referralService.getReferral(username, originalReferralId)
    const course = await this.courseService.getCourseByOffering(username, originalReferral.offeringId)

    return {
      course,
      data: originalReferral,
      href: paths.show.statusHistory({ referralId: originalReferralId }),
    }
  }
}
