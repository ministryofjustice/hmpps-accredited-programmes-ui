import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { CourseService, OrganisationService } from '../../services'
import { courseUtils, organisationUtils, typeUtils } from '../../utils'

export default class CourseOfferingsController {
  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const courseService = new CourseService(req.user.token)
      const organisationService = new OrganisationService(req.user.token)
      const course = await courseService.getCourse(req.params.id)
      const courseOffering = await courseService.getOffering(req.params.id, req.params.courseOfferingId)
      const organisation = await organisationService.getOrganisation(courseOffering.organisationId)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      const coursePresenter = courseUtils.presentCourse(course)

      res.render('courses/offerings/show', {
        pageHeading: coursePresenter.nameAndAlternateName,
        course: coursePresenter,
        organisation: organisationUtils.presentOrganisationWithOfferingEmail(organisation, courseOffering.contactEmail),
      })
    }
  }
}
