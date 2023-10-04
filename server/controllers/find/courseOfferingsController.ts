import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, OrganisationUtils, TypeUtils } from '../../utils'

export default class CourseOfferingsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const course = await this.courseService.getCourseByOffering(req.user.token, req.params.courseOfferingId)
      const courseOffering = await this.courseService.getOffering(req.user.token, req.params.courseOfferingId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)
      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('courses/offerings/show', {
        course: coursePresenter,
        courseOffering,
        organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
        pageHeading: coursePresenter.nameAndAlternateName,
      })
    }
  }
}
