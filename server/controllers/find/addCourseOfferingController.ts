import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, OrganisationUtils, TypeUtils } from '../../utils'

export default class AddCourseOfferingController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params

      const course = await this.courseService.getCourse(req.user.username, courseId)
      const organisations = await this.organisationService.getAllOrganisations(req.user.token)
      const organisationSelectItems = OrganisationUtils.organisationSelectItems(organisations)

      res.render('courses/offerings/form/show', {
        action: findPaths.offerings.add.create({ courseId }),
        backLinkHref: findPaths.show({ courseId }),
        organisationSelectItems,
        pageHeading: 'Add a Location',
        showBuildingChoicesOptions: CourseUtils.isBuildingChoices(course.displayName),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { courseId } = req.params
      const {
        contactEmail,
        organisationId,
        referable,
        secondaryContactEmail,
        withdrawn,
        createGeneralOffenceStrand,
        createSexualOffenceStrand,
        targetsWomensPrison,
      } = req.body as Record<string, string>

      if (createGeneralOffenceStrand === 'true' || createSexualOffenceStrand === 'true') {
        if (createGeneralOffenceStrand === 'true') {
          const generalOffenceCourses = await this.courseService.getBuildingChoicesVariants(
            req.user?.username,
            courseId,
            { isConvictedOfSexualOffence: 'false', isInAWomensPrison: targetsWomensPrison },
          )
          await this.courseService.addCourseOffering(req.user.username, generalOffenceCourses[0].id, {
            contactEmail,
            organisationId,
            referable: referable === 'true',
            secondaryContactEmail,
            withdrawn: withdrawn ? withdrawn === 'true' : undefined,
          })
        }

        if (createSexualOffenceStrand === 'true') {
          const sexualOffenceCourses = await this.courseService.getBuildingChoicesVariants(
            req.user?.username,
            courseId,
            { isConvictedOfSexualOffence: 'true', isInAWomensPrison: targetsWomensPrison },
          )
          await this.courseService.addCourseOffering(req.user.username, sexualOffenceCourses[0].id, {
            contactEmail,
            organisationId,
            referable: referable === 'true',
            secondaryContactEmail,
            withdrawn: withdrawn ? withdrawn === 'true' : undefined,
          })
        }
        return res.redirect(findPaths.buildingChoices.form.show({ courseId }))
      }

      const offering = await this.courseService.addCourseOffering(req.user.username, courseId, {
        contactEmail,
        organisationId,
        referable: referable === 'true',
        secondaryContactEmail,
        withdrawn: withdrawn ? withdrawn === 'true' : undefined,
      })

      return res.redirect(findPaths.offerings.show({ courseOfferingId: offering.id }))
    }
  }
}
