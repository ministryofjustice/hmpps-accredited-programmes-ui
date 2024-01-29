import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { CaseListUtils, CourseUtils, PaginationUtils, PathUtils, StringUtils, TypeUtils } from '../../utils'

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
      const { page, status, strand: audience } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const courses = await this.courseService.getCoursesByOrganisation(username, activeCaseLoadId)

      const formattedCourseName = StringUtils.convertFromUrlSlug(courseName)
      const selectedCourse = courses.find(course => course.name === formattedCourseName)

      if (!selectedCourse) {
        throw createError(404, `${formattedCourseName} not found.`)
      }

      const statusQuery = status || ['assessment_started', 'awaiting_assessment', 'referral_submitted'].join(',')

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
        courseName: selectedCourse.name,
        page: page ? (Number(page) - 1).toString() : undefined,
        status: CaseListUtils.uiToApiStatusQueryParam(statusQuery),
      })

      const pagination = PaginationUtils.pagination(
        req.path,
        CaseListUtils.queryParamsExcludingPage(audience, status),
        paginatedReferralSummaries.pageNumber,
        paginatedReferralSummaries.totalPages,
      )

      return res.render('referrals/caseList/assess/show', {
        action: assessPaths.caseList.filter({ courseName }),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: CourseUtils.courseNameWithAlternateName(selectedCourse),
        pagination,
        primaryNavigationItems: CaseListUtils.primaryNavigationItems(req.path, courses),
        referralStatusSelectItems: CaseListUtils.statusSelectItems(status),
        tableRows: CaseListUtils.tableRows(paginatedReferralSummaries.content, [
          'Name / Prison number',
          'Conditional release date',
          'Parole eligibility date',
          'Tariff end date',
          'Programme strand',
          'Referral status',
        ]),
      })
    }
  }
}
