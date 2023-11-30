import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, ReferralService } from '../../services'
import { CaseListUtils, CourseUtils, PathUtils, StringUtils, TypeUtils } from '../../utils'
import type { QueryParam } from '@accredited-programmes/ui'

export default class CaseListController {
  constructor(
    private readonly courseService: CourseService,
    private readonly referralService: ReferralService,
  ) {}

  filter(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseName } = req.params
      const queryParams: Array<QueryParam> = []

      if (req.body.audience) {
        queryParams.push({ key: 'strand', value: req.body.audience })
      }

      if (req.body.status) {
        queryParams.push({ key: 'status', value: req.body.status })
      }

      return res.redirect(PathUtils.pathWithQuery(assessPaths.caseList.show({ courseName }), queryParams))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseName } = req.params
      const { status, strand: audience } = req.query as Record<string, string>

      const { activeCaseLoadId, username } = res.locals.user

      const courses = await this.courseService.getCoursesByOrganisation(username, activeCaseLoadId)

      const formattedCourseName = StringUtils.convertFromUrlSlug(courseName)
      const selectedCourse = courses.find(course => course.name === formattedCourseName)

      if (!selectedCourse) {
        throw createError(404, `${formattedCourseName} not found.`)
      }

      const paginatedReferralSummaries = await this.referralService.getReferralSummaries(username, activeCaseLoadId, {
        audience: CaseListUtils.uiToApiAudienceQueryParam(audience),
        courseName: selectedCourse.name,
        status: CaseListUtils.uiToApiStatusQueryParam(status),
      })

      return res.render('referrals/caseList/show', {
        action: assessPaths.caseList.filter({ courseName }),
        audienceSelectItems: CaseListUtils.audienceSelectItems(audience),
        pageHeading: CourseUtils.courseNameWithAlternateName(selectedCourse),
        primaryNavigationItems: CaseListUtils.caseListPrimaryNavigationItems(req.path, courses),
        referralStatusSelectItems: CaseListUtils.statusSelectItems(status),
        tableRows: CaseListUtils.caseListTableRows(paginatedReferralSummaries.content),
      })
    }
  }
}
