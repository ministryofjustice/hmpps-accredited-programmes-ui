import type { Request, Response, TypedRequestHandler } from 'express'

import type { ReferralService } from '../../services'
import { ReferralUtils, TypeUtils } from '../../utils'

export default class CaseListController {
  constructor(private readonly referralService: ReferralService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { audience, status } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        audience,
        status,
      })

      return res.render('referrals/caseList/show', {
        audienceSelectItems: ReferralUtils.audienceSelectItems(audience),
        pageHeading: 'My referrals',
        referralStatusSelectItems: ReferralUtils.statusSelectItems(status),
        tableRows: ReferralUtils.caseListTableRows(paginatedReferralSummaries.content),
      })
    }
  }
}
