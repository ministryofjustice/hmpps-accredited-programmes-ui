import type { Request, Response, TypedRequestHandler } from 'express'
import createHttpError from 'http-errors'

import { referralStatusGroups } from '../../@types/models/Referral'
import { referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { CaseListUtils, PaginationUtils, PathUtils, TypeUtils } from '../../utils'
import type { Paginated, ReferralStatusGroup, ReferralView } from '@accredited-programmes/models'
import { type CaseListColumnHeader, type SortableCaseListColumnKey } from '@accredited-programmes/ui'

export default class ReferCaseListController {
  constructor(private readonly referralService: ReferralService) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { referralStatusGroup } = req.params
      const { nameOrId } = req.body

      return res.redirect(
        PathUtils.pathWithQuery(
          referPaths.caseList.show({ referralStatusGroup }),
          CaseListUtils.queryParamsExcludingPage(undefined, undefined, undefined, undefined, nameOrId),
        ),
      )
    }
  }

  indexRedirect(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      res.redirect(referPaths.caseList.show({ referralStatusGroup: 'open' }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { nameOrId, page, sortColumn, sortDirection } = req.query as Record<string, string>
      const { username } = res.locals.user
      const { referralStatusGroup } = req.params as { referralStatusGroup: ReferralStatusGroup }

      const isValidReferralStatusGroup = referralStatusGroups.includes(referralStatusGroup)

      if (!isValidReferralStatusGroup) {
        throw createHttpError(404, 'Not found')
      }

      const allReferralViews: Record<ReferralStatusGroup, Paginated<ReferralView>> = Object.fromEntries(
        await Promise.all(
          referralStatusGroups.map(async group => {
            const referralViews = await this.referralService.getMyReferralViews(username, {
              nameOrId,
              page: page ? (Number(page) - 1).toString() : undefined,
              sortColumn,
              sortDirection,
              statusGroup: group,
            })
            return [group, referralViews]
          }),
        ),
      )
      const selectedReferralViews = allReferralViews[referralStatusGroup]

      let selectedReferralViewsPaginatedContent = selectedReferralViews.content

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(undefined, undefined, sortColumn, sortDirection, nameOrId),
        selectedReferralViews.pageNumber,
        selectedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        referPaths.caseList.show({ referralStatusGroup }),
        CaseListUtils.queryParamsExcludingSort(undefined, undefined, page, nameOrId),
      )

      /* eslint-disable sort-keys */
      const sortableCaseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
        surname: 'Name and prison number',
        submittedOn: 'Date referred',
        earliestReleaseDate: 'Earliest release date',
        organisationName: 'Programme location',
        listDisplayName: 'Programme name',
      }
      /* eslint-enable sort-keys */

      const isDraftCaseList = referralStatusGroup === 'draft'

      if (isDraftCaseList) {
        selectedReferralViewsPaginatedContent = await Promise.all(
          selectedReferralViewsPaginatedContent.map(async referralView => {
            const tasksCompleted = await this.referralService.getNumberOfTasksCompleted(username, referralView.id)
            return { ...referralView, tasksCompleted }
          }),
        )
      } else {
        sortableCaseListColumns.status = 'Referral status'
      }

      req.session.recentCaseListPath = req.originalUrl

      return res.render('referrals/caseList/refer/show', {
        action: referPaths.caseList.filter({ referralStatusGroup }),
        draftReferralDeletedMessage: req.flash('draftReferralDeletedMessage')[0],
        isMyReferralsPage: true,
        nameOrId,
        otherStatusGroups: referralStatusGroups.filter(group => group !== referralStatusGroup),
        pageHeading: 'My referrals',
        pageTitleOverride: `My ${referralStatusGroup} referrals`,
        pagination,
        referralStatusGroup,
        subNavigationItems: CaseListUtils.referSubNavigationItems(
          req.path,
          {
            closed: allReferralViews.closed.totalElements,
            draft: allReferralViews.draft.totalElements,
            open: allReferralViews.open.totalElements,
          },
          CaseListUtils.queryParamsExcludingPage(undefined, undefined, sortColumn, sortDirection, nameOrId),
        ),
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
          selectedReferralViewsPaginatedContent,
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
