import type { Request, Response, TypedRequestHandler } from 'express'

import { referPathBase } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseUtils, ShowReferralUtils, TypeUtils } from '../../utils'

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
      const { activeCaseLoadId } = res.locals.user
      const { updatePerson } = req.query as Record<string, string>
      const isRefer = req.path.startsWith(referPathBase.pattern)

      const referral = await this.referralService.getReferral(username, referralId, { updatePerson })

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
        pageHeading: `Referral to ${coursePresenter.displayName}`,
        pageSubHeading: 'Status history',
        person,
        referral,
        subNavigationItems: ShowReferralUtils.subNavigationItems(
          req.path,
          'statusHistory',
          referral.id,
          activeCaseLoadId,
        ),
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory),
      })
    }
  }
}
