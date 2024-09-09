import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { OrganisationUtils, TypeUtils } from '../../utils'

export default class UpdateCourseOfferingController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId } = req.params

      const [offering, organisations] = await Promise.all([
        this.courseService.getOffering(req.user.token, courseOfferingId),
        this.organisationService.getAllOrganisations(req.user.token),
      ])

      const organisationSelectItems = OrganisationUtils.organisationSelectItems(organisations)

      res.render('courses/offerings/form/show', {
        action: `${findPaths.offerings.update.submit({ courseOfferingId })}?_method=PUT`,
        backLinkHref: findPaths.offerings.show({ courseOfferingId }),
        offering,
        organisationSelectItems,
        pageHeading: 'Update location',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId } = req.params
      const { contactEmail, organisationId, referable, secondaryContactEmail, withdrawn } = req.body as Record<
        string,
        string
      >

      const course = await this.courseService.getCourseByOffering(req.user.token, courseOfferingId)

      await this.courseService.updateCourseOffering(req.user.username, course.id, {
        contactEmail,
        id: courseOfferingId,
        organisationId,
        referable: referable === 'true',
        secondaryContactEmail,
        withdrawn: withdrawn ? withdrawn === 'true' : undefined,
      })

      res.redirect(findPaths.offerings.show({ courseOfferingId }))
    }
  }
}
