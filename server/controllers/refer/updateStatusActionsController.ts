import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

export default class UpdateStatusActionsController {
  manageHold(): TypedRequestHandler<Request, Response> {
    return (req: Request, res: Response) => {
      const { referralId } = req.params
      const { status } = req.query as { status: ReferralStatusUppercase }

      req.session.referralStatusUpdateData = {
        referralId,
        status,
      }

      return res.redirect(referPaths.updateStatus.selection.show({ referralId }))
    }
  }

  withdraw(): TypedRequestHandler<Request, Response> {
    return (req: Request, res: Response) => {
      const { referralId } = req.params

      req.session.referralStatusUpdateData = {
        referralId,
        status: 'WITHDRAWN',
      }

      return res.redirect(referPaths.updateStatus.category.show({ referralId }))
    }
  }
}
