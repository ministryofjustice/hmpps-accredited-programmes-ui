import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, ReferralService } from '../../services'

export default class TransferBuildingChoicesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      return res.render('referrals/transfer/duplicate', {})
    }
  }
}
