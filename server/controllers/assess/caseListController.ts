import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, ReferenceDataService, ReferralService } from '../../services'
import { CaseListUtils, CourseUtils, FormUtils, PaginationUtils, PathUtils, TypeUtils } from '../../utils'
import type { Paginated, ReferralStatusGroup, ReferralView } from '@accredited-programmes/models'
import type { CaseListColumnHeader, SortableCaseListColumnKey } from '@accredited-programmes/ui'

export default class AssessCaseListController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, referralStatusGroup } = req.params
      const { audience, nameOrId, status, hasLdc } = req.body

      if (!audience && !status && !nameOrId) {
        req.flash('audienceError', 'Choose a filter')
        req.flash('nameOrIdError', 'Enter a name or prison number')
        return res.redirect(assessPaths.caseList.show({ courseId, referralStatusGroup }))
      }

      return res.redirect(
        PathUtils.pathWithQuery(
          assessPaths.caseList.show({ courseId, referralStatusGroup }),
          CaseListUtils.queryParamsExcludingPage(audience, status, undefined, undefined, nameOrId, hasLdc),
        ),
      )
    }
  }

  indexRedirect(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { activeCaseLoadId, username } = res.locals.user

      const courses = await this.courseService.getCoursesByOrganisation(username, activeCaseLoadId)

      if (!courses.length) {
        throw createError(404, 'No courses found.')
      }

      const sortedCourses = courses.sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

      res.redirect(assessPaths.caseList.show({ courseId: sortedCourses[0].id, referralStatusGroup: 'open' }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params
      const {
        nameOrId,
        hasLdc,
        page,
        status,
        strand: audience,
        sortColumn,
        sortDirection,
      } = req.query as Record<string, string>
      const referralsFiltered = !!status || !!audience || !!nameOrId || !!hasLdc
      const { referralStatusGroup } = req.params as { referralStatusGroup: ReferralStatusGroup }

      const statusGroups: Array<ReferralStatusGroup> = ['open', 'closed']
      const isValidReferralStatusGroup = statusGroups.includes(referralStatusGroup)
      FormUtils.setFieldErrors(req, res, ['audience', 'nameOrId', 'status'])

      if (!isValidReferralStatusGroup) {
        throw createError(404, 'Not found')
      }

      const { activeCaseLoadId, username } = res.locals.user

      const [courses, courseAudiences] = await Promise.all([
        this.courseService.getCoursesByOrganisation(username, activeCaseLoadId),
        this.courseService.getCourseAudiences(username, { courseId }),
      ])

      const selectedCourse = courses.find(course => course.id === courseId)

      if (!selectedCourse) {
        throw createError(404, `Course with ID ${courseId} not found.`)
      }

      const [allReferralViews, referralStatuses] = await Promise.all([
        Object.fromEntries(
          await Promise.all(
            statusGroups.map(async group => {
              const referralViews = await this.referralService.getReferralViews(username, activeCaseLoadId, {
                audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
                courseName: selectedCourse.name,
                hasLdc: hasLdc === 'true',
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
        CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection, nameOrId),
        selectedReferralViews.pageNumber,
        selectedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        assessPaths.caseList.show({ courseId, referralStatusGroup }),
        CaseListUtils.queryParamsExcludingSort(audience, status, page, nameOrId),
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

      return res.render('referrals/caseList/assess/show', {
        action: assessPaths.caseList.filter({ courseId, referralStatusGroup }),
        /** INFO: This is more recently presented as 'Strands' in UI mock ups */
        audienceSelectItems: CaseListUtils.audienceSelectItems(
          courseAudiences,
          CourseUtils.isBuildingChoices(selectedCourse.displayName),
          audience,
        ),
        nameOrId,
        pageHeading: selectedCourse.name,
        pageTitleOverride: `Manage ${referralStatusGroup} programme team referrals: ${selectedCourse.name}`,
        pagination,
        primaryNavigationItems: CaseListUtils.primaryNavigationItems(req.path, courses),
        referralStatusGroup,
        referralStatusSelectItems: {
          closed: CaseListUtils.statusSelectItems(closedReferralStatuses, status, true),
          open: CaseListUtils.statusSelectItems(openReferralStatuses, status, true),
        },
        referralsFiltered,
        subNavigationItems: CaseListUtils.assessSubNavigationItems(
          req.path,
          courseId,
          {
            closed: allReferralViews.closed.totalElements,
            open: allReferralViews.open.totalElements,
          },
          CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection, nameOrId),
        ),
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
