import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class ProgrammeHistoryDetailController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const isAssess = req.path.startsWith(assessPathBase.pattern)
      const isNewReferral = req.path.startsWith(referPaths.new.create.pattern)
      const paths = isAssess ? assessPaths : referPaths

      const { courseParticipationId, referralId } = req.params

      const previousPage = isNewReferral
        ? referPaths.new.programmeHistory.index({ referralId })
        : `${paths.show.programmeHistory({ referralId })}#content`

      const [referral, courseParticipation] = await Promise.all([
        this.referralService.getReferral(req.user.username, referralId),
        this.courseService.getParticipation(req.user.username, courseParticipationId),
      ])

      if (courseParticipation.prisonNumber !== referral.prisonNumber) {
        return res.redirect(previousPage)
      }

      const [summaryListOptions, person] = await Promise.all([
        this.courseService.presentCourseParticipation(req.user.token, courseParticipation, referralId, undefined, {
          change: false,
          remove: false,
        }),
        this.personService.getPerson(req.user.username, referral.prisonNumber),
      ])

      return res.render('referrals/show/programmeHistoryDetail', {
        backLinkHref: previousPage,
        hideTitleServiceName: true,
        pageHeading: 'Programme history details',
        person,
        referralId,
        summaryListOptions,
      })
    }
  }
}
