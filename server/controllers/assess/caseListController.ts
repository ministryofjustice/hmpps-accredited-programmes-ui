import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { CaseListUtils, CourseUtils, PaginationUtils, PathUtils, StringUtils, TypeUtils } from '../../utils'
import type { CaseListColumnHeader, SortableCaseListColumnKey } from '@accredited-programmes/ui'

export default class AssessCaseListController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseName } = req.params

      return res.redirect(
        PathUtils.pathWithQuery(
          assessPaths.caseList.show({ courseName }),
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
      const firstCourseName = StringUtils.convertToUrlSlug(sortedCourses[0].name)

      res.redirect(assessPaths.caseList.show({ courseName: firstCourseName }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseName } = req.params
      const { page, status, strand: audience, sortColumn, sortDirection } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const courses = await this.courseService.getCoursesByOrganisation(username, activeCaseLoadId)

      const formattedCourseName = StringUtils.convertFromUrlSlug(courseName)
      const selectedCourse = courses.find(course => course.name === formattedCourseName)

      if (!selectedCourse) {
        throw createError(404, `${formattedCourseName} not found.`)
      }

      const statusQuery = status || ['assessment_started', 'awaiting_assessment', 'referral_submitted'].join(',')

      const paginatedReferralViews = await this.referralService.getReferralViews(username, activeCaseLoadId, {
        audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
        courseName: selectedCourse.name,
        page: page ? (Number(page) - 1).toString() : undefined,
        sortColumn,
        sortDirection,
        status: CaseListUtils.uiToApiStatusQueryParam(statusQuery),
      })

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(audience, status, sortColumn, sortDirection),
        paginatedReferralViews.pageNumber,
        paginatedReferralViews.totalPages,
      )

      const basePathExcludingSort = PathUtils.pathWithQuery(
        assessPaths.caseList.show({ courseName }),
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
        action: assessPaths.caseList.filter({ courseName }),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: CourseUtils.courseNameWithAlternateName(selectedCourse),
        pagination,
        primaryNavigationItems: CaseListUtils.primaryNavigationItems(req.path, courses),
        referralStatusSelectItems: CaseListUtils.statusSelectItems(status),
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
