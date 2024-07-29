import type { Request, Response, TypedRequestHandler } from 'express'

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

      const courses = await this.courseService.getCourses(req.user.token)

      res.render('courses/index', {
        addProgrammePath: findPaths.course.add.show({}),
        courses: courses
          .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
          .map(course => CourseUtils.presentCourse(course)),
        pageHeading: 'Find an Accredited Programme',
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const course = await this.courseService.getCourse(req.user.token, req.params.courseId)
      const offerings = await this.courseService.getOfferingsByCourse(req.user.token, course.id)

      const organisationIds = offerings.map((offering: CourseOffering) => offering.organisationId)
      const organisations = await this.organisationService.getOrganisations(req.user.token, organisationIds)

      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = offerings.find(offering => offering.organisationId === organisation.id) as CourseOffering
        return { ...organisation, courseOfferingId: courseOffering.id }
      })

      const organisationsTableData = OrganisationUtils.organisationTableRows(organisationsWithOfferingIds)

      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('courses/show', {
        addOfferingPath: findPaths.offerings.add.create({ courseId: course.id }),
        course: coursePresenter,
        organisationsTableData,
        pageHeading: coursePresenter.displayName,
      })
    }
  }
}
