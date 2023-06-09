import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OrganisationService } from '../../services'
import presentCourse from '../../utils/courseUtils'
import { organisationTableRows } from '../../utils/organisationUtils'
import { assertHasUser, isNotNull } from '../../utils/typeUtils'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'

export default class CoursesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      assertHasUser(req)

      const courses = await this.courseService.getCourses(req.user.token)

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: courses.map(course => presentCourse(course)),
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      assertHasUser(req)

      const course = await this.courseService.getCourse(req.user.token, req.params.id)
      const offerings = await this.courseService.getOfferingsByCourse(req.user.token, course.id)

      const unresolvedOrganisationPromises = offerings.map((offering: CourseOffering) => {
        return this.organisationService.getOrganisation(req.user.token, offering.organisationId)
      })

      const organisations: Array<Organisation> = (await Promise.all(unresolvedOrganisationPromises)).filter(
        isNotNull<Organisation>,
      )

      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = offerings.find(offering => offering.organisationId === organisation.id) as CourseOffering
        return { ...organisation, courseOfferingId: courseOffering.id }
      })

      const organisationsTableData = organisationTableRows(course, organisationsWithOfferingIds)

      res.render('courses/show', {
        pageHeading: course.name,
        course: presentCourse(course),
        organisationsTableData,
      })
    }
  }
}
