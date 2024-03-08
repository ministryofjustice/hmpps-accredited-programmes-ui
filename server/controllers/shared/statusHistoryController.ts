import type { Request, Response, TypedRequestHandler } from 'express'

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

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { updatePerson } = req.query as Record<string, string>

      const referral = await this.referralService.getReferral(username, referralId, { updatePerson })

      const [course, statusHistory, person] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads),
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

      return res.render('referrals/show/statusHistory/show', {
        buttons: ShowReferralUtils.buttons(req.path, referral),
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        pageSubHeading: 'Status history',
        person,
        referral,
        subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'statusHistory', referral.id),
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory),
      })
    }
  }
}
