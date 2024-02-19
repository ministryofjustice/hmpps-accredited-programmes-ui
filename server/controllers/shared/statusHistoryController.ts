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
      const { username } = req.user

      const referral = await this.referralService.getReferral(username, referralId)

      const [course, person] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads),
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

      return res.render('referrals/show/statusHistory/show', {
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        pageSubHeading: 'Status history',
        person,
        referral,
        subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'statusHistory', referral.id),
      })
    }
  }
}
