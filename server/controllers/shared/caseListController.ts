import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { CaseListUtils, PathUtils, TypeUtils } from '../../utils'
import PaginationUtils from '../../utils/paginationUtils'
import type { Referral } from '@accredited-programmes/models'

export default class CaseListController {
  constructor(private readonly referralService: ReferralService) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      return res.redirect(
        PathUtils.pathWithQuery(
          assessPaths.caseList.show({}),
          CaseListUtils.queryParamsExcludingPage(req.body.audience, req.body.status),
        ),
      )
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { page, status, strand: audience } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
        page: page ? (Number(page) - 1).toString() : undefined,
        status: CaseListUtils.uiToApiStatusQueryParam(status),
      })

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(audience, status as Referral['status']),
        paginatedReferralSummaries.pageNumber,
        paginatedReferralSummaries.totalPages,
      )

      return res.render('referrals/caseList/show', {
        action: assessPaths.caseList.filter({}),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: 'My referrals',
        pagination,
        referralStatusSelectItems: CaseListUtils.statusSelectItems(status),
        tableRows: CaseListUtils.caseListTableRows(paginatedReferralSummaries.content),
      })
    }
  }
}
