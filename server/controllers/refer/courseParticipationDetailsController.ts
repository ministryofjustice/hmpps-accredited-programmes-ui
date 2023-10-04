import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, PersonService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class CourseParticipationDetailsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { courseParticipationId, referralId } = req.params

      await this.courseService.getParticipation(req.user.token, courseParticipationId)

      const referral = await this.referralService.getReferral(req.user.token, referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      res.render('referrals/courseParticipations/details/show', {
        courseParticipationId,
        pageHeading: 'Add Accredited Programme details',
        person,
        referralId,
      })
    }
  }
}
