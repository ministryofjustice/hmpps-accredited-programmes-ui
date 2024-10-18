import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
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
