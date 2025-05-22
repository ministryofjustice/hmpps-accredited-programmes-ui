import type { Request, Response, TypedRequestHandler } from 'express'

import config from '../../config'
import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { CourseUtils, OrganisationUtils, TypeUtils } from '../../utils'
import type { CourseOffering } from '@accredited-programmes/models'

export default class CoursesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      delete req.session.buildingChoicesData
      delete req.session.pniFindAndReferData

      const courses = await this.courseService.getCourses(req.user.username)
      const coursesToDisplay = courses
        .filter(course => course.displayOnProgrammeDirectory)
        .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
        .map(course => CourseUtils.presentCourse(course))

      res.render('courses/index', {
        addProgrammePath: findPaths.course.add.show({}),
        courses: coursesToDisplay,
        hideTitleServiceName: true,
        pageHeading: 'Find an Accredited Programme',
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const isPniFind = req.session.pniFindAndReferData !== undefined
      const showWithdrawnCourses = res.locals.user.roles.includes(ApplicationRoles.ACP_EDITOR)

      const course = await this.courseService.getCourse(req.user.username, req.params.courseId)
      const offerings = await this.courseService.getOfferingsByCourse(req.user.username, course.id, {
        includeWithdrawn: showWithdrawnCourses,
      })

      const organisationIds = offerings.map((offering: CourseOffering) => offering.organisationId)
      const organisations = await this.organisationService.getOrganisations(req.user.token, organisationIds)

      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = offerings.find(offering => offering.organisationId === organisation.id) as CourseOffering
        return { ...organisation, courseOfferingId: courseOffering.id, withdrawn: courseOffering.withdrawn }
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

      const canReferToHsp = isPniFind && config.flags.hspEnabled && CourseUtils.isHsp(course.name)
      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('courses/show', {
        course: coursePresenter,
        hideTitleServiceName: true,
        hrefs: {
          addOffering: findPaths.offerings.add.create({ courseId: course.id }),
          back: isPniFind ? findPaths.pniFind.recommendedProgrammes({}) : findPaths.index({}),
          startHspReferral: canReferToHsp ? findPaths.hsp.details.show({ courseId: course.id }) : undefined,
          updateProgramme: findPaths.course.update.show({ courseId: course.id }),
        },
        isBuildingChoices: CourseUtils.isBuildingChoices(course.displayName),
        noOfferingsMessage: CourseUtils.noOfferingsMessage(course.name),
        organisationsTableData,
        pageHeading: coursePresenter.displayName,
        pageTitleOverride: `${coursePresenter.displayName} programme description`,
        withdrawnOrganisationsTableData,
      })
    }
  }
}
