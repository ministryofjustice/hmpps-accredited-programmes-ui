import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths, referPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class TransferBuildingChoicesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      TypeUtils.assertHasUser(req)
      const { token: userToken, username } = req.user
      const person
      const organisation
      const course

      return res.render('referrals/transfer/duplicate', {
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        cancelHref: assessPaths.show.programmeHistory({ referralId }),
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        summaryText: `A referral already exists for ${person.name} to ${course.displayName} at ${organisation.name}.`,
        withdrawHref: assessPaths.updateStatus.reason.show({ referralId }),
      })
    }
  }

  withdraw(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      const withdrawStatus = 'WITHDRAWN'

      req.session.referralStatusUpdateData = {
        decisionForCategoryAndReason: withdrawStatus,
        finalStatusDecision: withdrawStatus,
        initialStatusDecision: withdrawStatus,
        referralId,
      }

      return res.redirect(referPaths.updateStatus.reason.show({ referralId }))
    }
  }
}
