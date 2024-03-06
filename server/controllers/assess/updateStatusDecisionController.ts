import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class UpdateStatusDecisionController {
  constructor(private readonly referralService: ReferralService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId) {
        delete req.session.referralStatusUpdateData
      }

      const [statusHistory, statusTransitions] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referralService.getStatusTransitions(username, referralId, { ptUser: true }),
      ])

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        statusTransitions,
        req.session.referralStatusUpdateData?.status,
      )

      FormUtils.setFieldErrors(req, res, ['statusDecision'])

      return res.render('referrals/updateStatus/decision/show', {
        action: assessPaths.updateStatus.decision.submit({ referralId }),
        backLinkHref: assessPaths.show.statusHistory({ referralId }),
        pageHeading: 'Update referral status',
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      const { statusDecision } = req.body

      if (!statusDecision) {
        req.flash('statusDecisionError', 'Select a status decision')

        return res.redirect(assessPaths.updateStatus.decision.show({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        previousPath: req.path,
        referralId,
        status: statusDecision,
      }

      if (statusDecision === 'WITHDRAWN') {
        return res.redirect(assessPaths.withdraw.category({ referralId }))
      }

      return res.redirect(assessPaths.updateStatus.selection.show({ referralId }))
    }
  }
}
