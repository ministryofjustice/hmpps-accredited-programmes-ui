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
      const { contactEmail, organisationId, referable, secondaryContactEmail, withdrawn } = req.body as Record<
        string,
        string
      >
      const { buildingChoicesOptions }: { buildingChoicesOptions: Array<string> } = req.body

      const createGeneralOffenceStrand = buildingChoicesOptions?.includes('createGeneralOffenceStrand')
        ? 'true'
        : 'false'
      const createSexualOffenceStrand = buildingChoicesOptions?.includes('createSexualOffenceStrand') ? 'true' : 'false'
      const targetsWomensPrison = buildingChoicesOptions?.includes('targetsWomensPrison') ? 'true' : 'false'

      if (createGeneralOffenceStrand === 'true' || createSexualOffenceStrand === 'true') {
        const currentBuildChoicesCourse = await this.courseService.getCourse(req.user.username, courseId)
        const buildingChoicesCourses = await this.courseService.getCourses(req.user?.username, {
          buildingChoicesOnly: 'true',
        })
        if (createGeneralOffenceStrand === 'true') {
          const generalOffenceCourse = buildingChoicesCourses.find(
            c => c.audience === 'General offence' && c.displayName === currentBuildChoicesCourse.displayName,
          )
          await this.courseService.addCourseOffering(req.user.username, generalOffenceCourse!.id, {
            contactEmail,
            gender: targetsWomensPrison ? 'FEMALE' : 'MALE',
            organisationId,
            referable: referable === 'true',
            secondaryContactEmail,
            withdrawn: withdrawn ? withdrawn === 'true' : undefined,
          })
        }

        if (createSexualOffenceStrand === 'true') {
          const sexualOffenceCourse = buildingChoicesCourses.find(c => c.audience === 'Sexual offence')
          await this.courseService.addCourseOffering(req.user.username, sexualOffenceCourse!.id, {
            contactEmail,
            gender: targetsWomensPrison ? 'FEMALE' : 'MALE',
            organisationId,
            referable: referable === 'true',
            secondaryContactEmail,
            withdrawn: withdrawn ? withdrawn === 'true' : undefined,
          })
        }
        return res.redirect(findPaths.buildingChoices.show({ courseId }))
      }

      const offering = await this.courseService.addCourseOffering(req.user.username, courseId, {
        contactEmail,
        organisationId,
        referable: referable === 'true',
        secondaryContactEmail,
        withdrawn: withdrawn ? withdrawn === 'true' : undefined,
      })

      return res.redirect(findPaths.offerings.show({ courseOfferingId: offering.id || '' }))
    }
  }
}
