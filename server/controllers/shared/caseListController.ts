import type { Request, Response, TypedRequestHandler } from 'express'

import type { ReferralService } from '../../services'
import { ReferralUtils, TypeUtils } from '../../utils'
import type { Caseload } from '@prison-api'

export default class CaseListController {
  constructor(private readonly referralService: ReferralService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { caseloads, username } = res.locals.user

      const activeCaseLoadId: Caseload['caseLoadId'] = caseloads.find((caseload: Caseload) => caseload.currentlyActive)
        ?.caseLoadId

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId)

      const tableRows = ReferralUtils.caseListTableRows(paginatedReferralSummaries.content)

      return res.render('referrals/caseList/show', {
        pageHeading: 'My referrals',
        tableRows,
      })
    }
  }
}
