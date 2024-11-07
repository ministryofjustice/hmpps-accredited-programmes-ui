import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, OrganisationUtils, TypeUtils } from '../../utils'

export default class BuildingChoicesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { buildingChoicesFormData } = req.session

      const { courseId } = req.params

      if (!buildingChoicesFormData?.isConvictedOfSexualOffence || !buildingChoicesFormData?.isInAWomensPrison) {
        return res.redirect(findPaths.index({}))
      }

      const courseVariants = await this.courseService.getBuildingChoicesVariants(
        req.user?.username,
        courseId,
        buildingChoicesFormData,
      )

      const course = courseVariants[0]

      const organisationIds = course.courseOfferings.map(offering => offering.organisationId)
      const organisations = await this.organisationService.getOrganisations(req.user.token, organisationIds)
      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = course.courseOfferings.find(offering => offering.organisationId === organisation.id)
        return { ...organisation, courseOfferingId: courseOffering?.id }
      })

      return res.render('courses/buildingChoices/show', {
        backLinkHref: findPaths.buildingChoices.form.show({ courseId }),
        buildingChoicesAnswersSummaryListRows:
          CourseUtils.buildingChoicesAnswersSummaryListRows(buildingChoicesFormData),
        course,
        organisationsTableData: OrganisationUtils.organisationTableRows(organisationsWithOfferingIds),
        pageHeading: course.displayName,
      })
    }
  }
}
