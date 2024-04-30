import type { Request, Response, TypedRequestHandler } from 'express'
import createHttpError from 'http-errors'

import { referralStatusGroups } from '../../@types/models/Referral'
import { referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { CaseListUtils, PaginationUtils, PathUtils, TypeUtils } from '../../utils'
import type { ReferralStatusGroup } from '@accredited-programmes/models'
import { type CaseListColumnHeader, type SortableCaseListColumnKey } from '@accredited-programmes/ui'

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

      const { page, sortColumn, sortDirection } = req.query as Record<string, string>
      const { username } = res.locals.user
      const { referralStatusGroup } = req.params as { referralStatusGroup: ReferralStatusGroup }

      const isValidReferralStatusGroup = referralStatusGroups.includes(referralStatusGroup)

      if (!isValidReferralStatusGroup) {
        throw createHttpError(404, 'Not found')
      }

      const paginatedReferralViews = await this.referralService.getMyReferralViews(username, {
        page: page ? (Number(page) - 1).toString() : undefined,
        sortColumn,
        sortDirection,
        statusGroup: referralStatusGroup,
      })

      let paginatedReferralViewsContent = paginatedReferralViews.content

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(undefined, undefined, sortColumn, sortDirection),
        paginatedReferralViews.pageNumber,
        paginatedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        referPaths.caseList.show({ referralStatusGroup }),
        CaseListUtils.queryParamsExcludingSort(undefined, undefined, page),
      )

      /* eslint-disable sort-keys */
      const sortableCaseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
        surname: 'Name / Prison number',
        submittedOn: 'Date referred',
        earliestReleaseDate: 'Earliest release date',
        nonDtoReleaseDateType: 'Release date type',
        organisationName: 'Programme location',
        listDisplayName: 'Programme name',
      }
      /* eslint-enable sort-keys */

      const isDraftCaseList = referralStatusGroup === 'draft'

      if (isDraftCaseList) {
        paginatedReferralViewsContent = await Promise.all(
          paginatedReferralViewsContent.map(async referralView => {
            const tasksCompleted = await this.referralService.getNumberOfTasksCompleted(username, referralView.id)
            return { ...referralView, tasksCompleted }
          }),
        )
      } else {
        sortableCaseListColumns.status = 'Referral status'
      }

      return res.render('referrals/caseList/refer/show', {
        isMyReferralsPage: true,
        pageHeading: 'My referrals',
        pagination,
        referralStatusGroup,
        subNavigationItems: CaseListUtils.referSubNavigationItems(req.path),
        tableHeadings: [
          ...CaseListUtils.sortableTableHeadings(
            basePathExcludingSort,
            sortableCaseListColumns,
            sortColumn,
            sortDirection,
          ),
          ...(isDraftCaseList ? [{ text: 'Progress' }] : []),
        ],
        tableRows: CaseListUtils.tableRows(
          paginatedReferralViewsContent,
          [
            ...Object.values(sortableCaseListColumns).map(value => value),
            ...(isDraftCaseList ? (['Progress'] as Array<CaseListColumnHeader>) : []),
          ],
          referPaths,
        ),
      })
    }
  }
}
