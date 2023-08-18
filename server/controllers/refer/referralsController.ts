import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export default class ReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params

      res.render('referrals/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })
    }
  }

  start(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const course = await this.courseService.getCourseByOffering(req.user.token, req.params.courseOfferingId)
      const courseOffering = await this.courseService.getOffering(
        req.user.token,
        course.id,
        req.params.courseOfferingId,
      )
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('referrals/start', {
        course: coursePresenter,
        courseOffering,
        organisation,
        pageHeading: 'Make a referral',
      })
    }
  }
}
