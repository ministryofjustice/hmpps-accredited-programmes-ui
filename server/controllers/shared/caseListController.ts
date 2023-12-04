import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { CaseListUtils, PathUtils, TypeUtils } from '../../utils'
import type { QueryParam } from '@accredited-programmes/ui'

export default class CaseListController {
  constructor(private readonly referralService: ReferralService) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const queryParams: Array<QueryParam> = []

      if (req.body.audience) {
        queryParams.push({ key: 'strand', value: req.body.audience })
      }

      if (req.body.status) {
        queryParams.push({ key: 'status', value: req.body.status })
      }

      return res.redirect(PathUtils.pathWithQuery(assessPaths.caseList.show({}), queryParams))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { status, strand: audience } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
        status: CaseListUtils.uiToApiStatusQueryParam(status),
      })

      return res.render('referrals/caseList/show', {
        action: assessPaths.caseList.filter({}),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: 'My referrals',
        referralStatusSelectItems: CaseListUtils.statusSelectItems(status),
        tableRows: CaseListUtils.caseListTableRows(paginatedReferralSummaries.content),
      })
    }
  }
}
