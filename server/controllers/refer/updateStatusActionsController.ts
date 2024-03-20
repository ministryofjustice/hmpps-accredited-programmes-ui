import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'

export default class UpdateStatusActionsController {
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
