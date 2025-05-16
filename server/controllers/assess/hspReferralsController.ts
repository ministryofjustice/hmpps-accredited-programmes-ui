import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { assessPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import type { CaseListUtils, CourseUtils, FormUtils, PaginationUtils, PathUtils, TypeUtils } from '../../utils'
import type { Paginated, ReferralStatusGroup, ReferralView } from '@accredited-programmes/models'
import type { CaseListColumnHeader, SortableCaseListColumnKey } from '@accredited-programmes/ui'
import type { Audience } from '@accredited-programmes-api'

export default class HspReferralsController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralStatusGroup } = req.params
      const { nameOrId, status, audience: audiencePossiblyWithLdcSuffix } = req.body

      const { audienceName: audience, hasLdcString } =
        CourseUtils.decodeAudienceAndHasLdc(audiencePossiblyWithLdcSuffix)

      if (!audience && !status && !nameOrId) {
        req.flash('audienceError', 'Choose a filter')
        req.flash('nameOrIdError', 'Enter a name or prison number')
        return res.redirect(assessPaths.hspReferrals.show({ referralStatusGroup }))
      }

      return res.redirect(
        PathUtils.pathWithQuery(
          assessPaths.hspReferrals.show({ referralStatusGroup }),
          CaseListUtils.queryParamsExcludingPage(audience, status, undefined, undefined, nameOrId, hasLdcString),
        ),
      )
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const {
        nameOrId,
        hasLdc: hasLdcString,
        page,
        status,
        strand: audience,
        sortColumn,
        sortDirection,
      } = req.query as Record<string, string>
      const referralsFiltered = !!status || !!audience || !!nameOrId || !!hasLdcString
      const { referralStatusGroup } = req.params as { referralStatusGroup: ReferralStatusGroup }

      const statusGroups: Array<ReferralStatusGroup> = ['open', 'closed']
      const isValidReferralStatusGroup = statusGroups.includes(referralStatusGroup)
      FormUtils.setFieldErrors(req, res, ['audience', 'nameOrId', 'status'])

      if (!isValidReferralStatusGroup) {
        throw createError(404, 'Not found')
      }

      const { username } = res.locals.user

      const [allReferralViews, referralStatuses] = await Promise.all([
        Object.fromEntries(
          await Promise.all(
            statusGroups.map(async group => {
              const referralViews = await this.referralService.getHspReferralViews(username, {
                hasLdcString,
                nameOrId,
                page: page ? (Number(page) - 1).toString() : undefined,
                sortColumn,
                sortDirection,
                status,
                statusGroup: group,
              })
              return [group, referralViews]
            }),
          ),
        ) as Record<ReferralStatusGroup, Paginated<ReferralView>>,
        this.referenceDataService.getReferralStatuses(username),
      ])

      const openReferralStatuses = referralStatuses.filter(
        referralStatus => !referralStatus.closed && !referralStatus.draft,
      )

      const closedReferralStatuses = referralStatuses.filter(referralStatus => referralStatus.closed)

      const selectedReferralViews = allReferralViews[referralStatusGroup]

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection, nameOrId, hasLdcString),
        selectedReferralViews.pageNumber,
        selectedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        assessPaths.hspReferrals.show({ referralStatusGroup }),
        CaseListUtils.queryParamsExcludingSort(audience, status, page, nameOrId, hasLdcString),
      )

      /* eslint-disable sort-keys */
      const caseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
        surname: 'Name and prison number',
        location: 'Location',
        earliestReleaseDate: 'Earliest release date',
        sentenceType: 'Sentence type',
        audience: 'Programme strand',
        status: 'Referral status',
      }
      /* eslint-enable sort-keys */

      req.session.recentCaseListPath = req.originalUrl

      const courseAudiences: Audience = { name: 'Sexual offence' }
      const audienceSelectItems = CaseListUtils.audienceSelectItems(
        [courseAudiences],
        false,
        audience ? CourseUtils.encodeAudienceAndHasLdc(audience, hasLdcString) : undefined,
      )

      const hspCourseName = 'Healthy Sex Programme'
      return res.render('referrals/caseList/assess/show', {
        action: assessPaths.hspReferrals.filter({ referralStatusGroup }),
        /** INFO: This is more recently presented as 'Strands' in UI mock ups */
        audienceSelectItems,
        ldcStatusChangedMessage: req.flash('ldcStatusChangedMessage')[0],
        nameOrId,
        pageHeading: hspCourseName,
        pageTitleOverride: `Manage ${referralStatusGroup} programme team referrals: ${hspCourseName}`,
        pagination,
        referralStatusGroup,
        referralStatusSelectItems: {
          closed: CaseListUtils.statusSelectItems(closedReferralStatuses, status, true),
          open: CaseListUtils.statusSelectItems(openReferralStatuses, status, true),
        },
        referralsFiltered,
        // subNavigationItems: CaseListUtils.assessSubNavigationItems(
        //     req.path,
        //     {
        //         closed: allReferralViews.closed.totalElements,
        //         open: allReferralViews.open.totalElements,
        //     },
        //     CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection, nameOrId, hasLdcString),
        // ),
        subNavigationItems: [],
        tableHeadings: CaseListUtils.sortableTableHeadings(
          basePathExcludingSort,
          caseListColumns,
          sortColumn,
          sortDirection,
        ),
        tableRows: CaseListUtils.tableRows(
          selectedReferralViews.content,
          Object.values(caseListColumns).map(value => value),
        ),
      })
    }
  }
}
