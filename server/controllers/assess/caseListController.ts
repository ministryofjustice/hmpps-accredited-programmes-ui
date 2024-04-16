import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, ReferenceDataService, ReferralService } from '../../services'
import { CaseListUtils, CourseUtils, PaginationUtils, PathUtils, TypeUtils } from '../../utils'
import type { ReferralStatusGroup } from '@accredited-programmes/models'
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

      return res.redirect(
        PathUtils.pathWithQuery(
          assessPaths.caseList.show({ courseId, referralStatusGroup }),
          CaseListUtils.queryParamsExcludingPage(req.body.audience, req.body.status),
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
      const { page, status, strand: audience, sortColumn, sortDirection } = req.query as Record<string, string>
      const { referralStatusGroup } = req.params as { referralStatusGroup: ReferralStatusGroup }

      const isValidReferralStatusGroup = ['open', 'closed'].includes(referralStatusGroup)

      if (!isValidReferralStatusGroup) {
        throw createError(404, 'Not found')
      }

      const { activeCaseLoadId, username } = res.locals.user

      const courses = await this.courseService.getCoursesByOrganisation(username, activeCaseLoadId)

      const selectedCourse = courses.find(course => course.id === courseId)

      if (!selectedCourse) {
        throw createError(404, `Course with ID ${courseId} not found.`)
      }

      const [paginatedReferralViews, referralStatuses] = await Promise.all([
        this.referralService.getReferralViews(username, activeCaseLoadId, {
          audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
          courseName: selectedCourse.name,
          page: page ? (Number(page) - 1).toString() : undefined,
          sortColumn,
          sortDirection,
          status,
          statusGroup: referralStatusGroup,
        }),
        this.referenceDataService.getReferralStatuses(username),
      ])

      const availableStatuses = referralStatuses.filter(referralStatus =>
        referralStatusGroup === 'open' ? !referralStatus.closed && !referralStatus.draft : referralStatus.closed,
      )

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection),
        paginatedReferralViews.pageNumber,
        paginatedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        assessPaths.caseList.show({ courseId, referralStatusGroup }),
        CaseListUtils.queryParamsExcludingSort(audience, status, page),
      )

      /* eslint-disable sort-keys */
      const caseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
        surname: 'Name / Prison number',
        conditionalReleaseDate: 'Conditional release date',
        paroleEligibilityDate: 'Parole eligibility date',
        tariffExpiryDate: 'Tariff end date',
        audience: 'Programme strand',
        status: 'Referral status',
      }
      /* eslint-enable sort-keys */

      return res.render('referrals/caseList/assess/show', {
        action: assessPaths.caseList.filter({ courseId, referralStatusGroup }),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: CourseUtils.courseNameWithAlternateName(selectedCourse),
        pagination,
        primaryNavigationItems: CaseListUtils.primaryNavigationItems(req.path, courses),
        referralStatusGroup,
        referralStatusSelectItems: CaseListUtils.statusSelectItems(availableStatuses, status),
        subNavigationItems: CaseListUtils.assessSubNavigationItems(req.path, courseId),
        tableHeadings: CaseListUtils.sortableTableHeadings(
          basePathExcludingSort,
          caseListColumns,
          sortColumn,
          sortDirection,
        ),
        tableRows: CaseListUtils.tableRows(
          paginatedReferralViews.content,
          Object.values(caseListColumns).map(value => value),
        ),
      })
    }
  }
}
