import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { CourseService, OrganisationService } from '../../services'
import { courseUtils, typeUtils } from '../../utils'

export default class ReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  start(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const course = await this.courseService.getCourse(req.user.token, req.params.courseId)
      const courseOffering = await this.courseService.getOffering(
        req.user.token,
        req.params.courseId,
        req.params.courseOfferingId,
      )
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      const coursePresenter = courseUtils.presentCourse(course)

      res.render('referrals/start', {
        pageHeading: 'Make a referral',
        course: coursePresenter,
        courseOffering,
        organisation,
      })
    }
  }
}