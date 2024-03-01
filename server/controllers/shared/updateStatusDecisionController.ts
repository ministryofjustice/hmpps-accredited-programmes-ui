import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class UpdateStatusDecisionController {
  constructor(private readonly referralService: ReferralService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const isAssess = req.path.startsWith(assessPathBase.pattern)
      const paths = isAssess ? assessPaths : referPaths

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId) {
        delete req.session.referralStatusUpdateData
      }

      const [statusHistory, statusTranisitions] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referralService.getStatusTransitions(username, referralId, { ptUser: isAssess }),
      ])

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        statusTranisitions,
        req.session.referralStatusUpdateData?.status,
      )

      FormUtils.setFieldErrors(req, res, ['statusDecision'])

      return res.render('referrals/updateStatus/decision/show', {
        backLinkHref: paths.show.statusHistory({ referralId }),
        pageHeading: 'Update referral status',
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

      const { referralId } = req.params
      const { statusDecision } = req.body

      if (!statusDecision) {
        req.flash('statusDecisionError', 'Select a status decision')

        return res.redirect(paths.updateStatus.decision({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        referralId,
        status: statusDecision,
      }

      if (statusDecision === 'WITHDRAWN') {
        return res.redirect(paths.withdraw.category({ referralId }))
      }

      return res.redirect(paths.updateStatus.confirm({ referralId }))
    }
  }
}
