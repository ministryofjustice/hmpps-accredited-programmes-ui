import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { OrganisationUtils, TypeUtils } from '../../utils'

export default class AddCourseOfferingController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params

      const organisations = await this.organisationService.getAllOrganisations(req.user.token)

      const organisationSelectItems = OrganisationUtils.organisationSelectItems(organisations)

      res.render('courses/offerings/form/show', {
        action: findPaths.offerings.add.create({ courseId }),
        backLinkHref: findPaths.show({ courseId }),
        organisationSelectItems,
        pageHeading: 'Add a Location',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params
      const { contactEmail, organisationId, referable, secondaryContactEmail, withdrawn } = req.body as Record<
        string,
        string
      >

      const offering = await this.courseService.addCourseOffering(req.user.username, courseId, {
        contactEmail,
        organisationId,
        referable: referable === 'true',
        secondaryContactEmail,
        withdrawn: withdrawn ? withdrawn === 'true' : undefined,
      })

      res.redirect(findPaths.offerings.show({ courseOfferingId: offering.id }))
    }
  }
}
