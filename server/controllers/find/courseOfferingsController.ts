import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths, referPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, OrganisationUtils, TypeUtils } from '../../utils'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'

export default class CourseOfferingsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  delete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params

      await this.courseService.deleteOffering(req.user.token, courseId, courseOfferingId)

      res.redirect(findPaths.show({ courseId }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const [course, [courseOffering, organisation]] = await Promise.all([
        this.courseService.getCourseByOffering(req.user.token, req.params.courseOfferingId),
        this.courseService.getOffering(req.user.token, req.params.courseOfferingId).then(async _courseOffering => {
          // eslint-disable-next-line
          const _organisation = await this.organisationService.getOrganisation(
            req.user.token,
            _courseOffering.organisationId,
          )
          return [_courseOffering, _organisation] as [CourseOffering, Organisation]
        }),
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('courses/offerings/show', {
        course: coursePresenter,
        courseOffering,
        deleteOfferingAction: `${findPaths.offerings.delete({ courseId: course.id, courseOfferingId: courseOffering.id })}?_method=DELETE`,
        hideTitleServiceName: true,
        hrefs: {
          back: findPaths.show({ courseId: course.id }),
          makeReferral: referPaths.new.start({ courseOfferingId: courseOffering.id }),
          updateOffering: findPaths.offerings.update.show({
            courseOfferingId: courseOffering.id,
          }),
        },
        organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
        pageHeading: coursePresenter.displayName,
        pageTitleOverride: `${coursePresenter.displayName} programme at ${organisation.name}`,
      })
    }
  }
}
