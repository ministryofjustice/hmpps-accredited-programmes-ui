import type { Request, Response, TypedRequestHandler } from 'express'
import createHttpError from 'http-errors'

import { referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { CaseListUtils, PaginationUtils, TypeUtils } from '../../utils'
import type { ReferralStatus } from '@accredited-programmes/models'
import type { ReferralStatusGroup } from '@accredited-programmes/ui'

export default class ReferCaseListController {
  constructor(private readonly referralService: ReferralService) {}

  indexRedirect(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      res.redirect(referPaths.caseList.show({ referralStatusGroup: 'open' }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referralStatusGroups: Record<ReferralStatusGroup, Array<ReferralStatus>> = {
        closed: [],
        draft: ['referral_started'],
        open: ['assessment_started', 'awaiting_assessment', 'referral_submitted'],
      }

      const { page } = req.query as Record<string, string>
      const { activeCaseLoadId, username } = res.locals.user
      const { referralStatusGroup } = req.params

      const referralStatuses = referralStatusGroups[referralStatusGroup as ReferralStatusGroup]

      if (!referralStatuses) {
        throw createHttpError(404, 'Not found')
      }

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        page: page ? (Number(page) - 1).toString() : undefined,
        status: CaseListUtils.uiToApiStatusQueryParam(referralStatuses.join(',')),
      })

      const pagination = PaginationUtils.pagination(
        req.path,
        [],
        paginatedReferralSummaries.pageNumber,
        paginatedReferralSummaries.totalPages,
      )

      return res.render('referrals/caseList/refer/show', {
        isMyReferralsPage: true,
        pageHeading: 'My referrals',
        pagination,
        subNavigationItems: CaseListUtils.subNavigationItems(req.path),
        tableRows: CaseListUtils.referTableRows(paginatedReferralSummaries.content),
      })
    }
  }
}
