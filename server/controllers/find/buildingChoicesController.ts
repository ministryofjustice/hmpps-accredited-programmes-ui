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

      const { buildingChoicesData } = req.session
      const { courseId } = req.params

      if (!buildingChoicesData?.isConvictedOfSexualOffence || !buildingChoicesData?.isInAWomensPrison) {
        return res.redirect(findPaths.pniFind.personSearch({}))
      }

      const courseVariants = await this.courseService.getBuildingChoicesVariants(
        req.user?.username,
        courseId,
        buildingChoicesData,
      )

      const course = courseVariants[0]

      const organisationIds = course.courseOfferings.map(offering => offering.organisationId)
      const organisations = await this.organisationService.getOrganisations(req.user.token, organisationIds)
      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = course.courseOfferings.find(offering => offering.organisationId === organisation.id)
        return { ...organisation, courseOfferingId: courseOffering?.id, withdrawn: courseOffering?.withdrawn }
      })

      const organisationsTableData = OrganisationUtils.organisationTableRows(
        organisationsWithOfferingIds.filter(
          organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === false,
        ),
      )

      const withdrawnOrganisationsTableData = OrganisationUtils.organisationTableRows(
        organisationsWithOfferingIds.filter(
          organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === true,
        ),
      )

      return res.render('courses/buildingChoices/show', {
        buildingChoicesAnswersSummaryListRows: CourseUtils.buildingChoicesAnswersSummaryListRows(buildingChoicesData),
        course,
        hideTitleServiceName: true,
        hrefs: {
          addOffering: findPaths.offerings.add.create({ courseId: course.id }),
          back: findPaths.buildingChoices.form.show({ courseId }),
          updateProgramme: findPaths.course.update.show({ courseId: course.id }),
        },
        organisationsTableData,
        pageHeading: course.displayName,
        pageTitleOverride: `${course.displayName} programme description`,
        withdrawnOrganisationsTableData,
      })
    }
  }
}
