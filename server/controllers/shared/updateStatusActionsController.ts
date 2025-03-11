import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths, referPaths } from '../../paths'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

export default class UpdateStatusActionsController {
  manageHold(): TypedRequestHandler<Request, Response> {
    return (req: Request, res: Response) => {
      const { referralId } = req.params
      const { status } = req.query as { status: ReferralStatusUppercase }

      req.session.referralStatusUpdateData = {
        finalStatusDecision: status,
        referralId,
      }

      return res.redirect(referPaths.updateStatus.selection.show({ referralId }))
    }
  }

  withdraw(): TypedRequestHandler<Request, Response> {
    return (req: Request, res: Response) => {
      const { referralId } = req.params
      const withdrawStatus = 'WITHDRAWN'
      const paths = req.path.startsWith('/refer') ? referPaths : assessPaths

      req.session.referralStatusUpdateData = {
        decisionForCategoryAndReason: withdrawStatus,
        finalStatusDecision: withdrawStatus,
        initialStatusDecision: withdrawStatus,
        referralId,
      }

      return res.redirect(paths.updateStatus.reason.show({ referralId }))
    }
  }
}
