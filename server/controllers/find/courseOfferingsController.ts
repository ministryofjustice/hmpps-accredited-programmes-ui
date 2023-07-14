import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { CourseService, OrganisationService } from '../../services'
import presentCourse from '../../utils/courseUtils'
import { presentOrganisationWithOfferingEmails } from '../../utils/organisationUtils'
import { assertHasUser } from '../../utils/typeUtils'

export default class CourseOfferingsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      assertHasUser(req)

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

      const coursePresenter = presentCourse(course)

      res.render('courses/offerings/show', {
        pageHeading: coursePresenter.nameAndAlternateName,
        course: coursePresenter,
        organisation: presentOrganisationWithOfferingEmails(organisation, courseOffering, course.name),
      })
    }
  }
}
