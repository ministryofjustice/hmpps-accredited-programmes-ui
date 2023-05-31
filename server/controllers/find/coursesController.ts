import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OrganisationService } from '../../services'
import courseWithPrerequisiteSummaryListRows from '../../utils/courseUtils'
import organisationTableRows from '../../utils/organisationUtils'
import type { CourseOffering } from '@accredited-programmes/models'

export default class CoursesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const courses = await this.courseService.getCourses(req.user.token)
      const coursesWithPrerequisiteSummaryListRows = courses.map(course =>
        courseWithPrerequisiteSummaryListRows(course),
      )

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: coursesWithPrerequisiteSummaryListRows,
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const course = await this.courseService.getCourse(req.user.token, req.params.id)
      const offerings = await this.courseService.getOfferingsByCourse(req.user.token, course.id)

      const unresolvedOrganisationPromises = offerings.map((offering: CourseOffering) => {
        return this.organisationService.getOrganisation(req.user.token, offering.organisationId)
      })

      const organisations = (await Promise.all(unresolvedOrganisationPromises)).filter(organisation => organisation)

      const organisationsTableData = organisationTableRows(course, organisations)

      res.render('courses/show', {
        pageHeading: course.name,
        course: courseWithPrerequisiteSummaryListRows(course),
        organisationsTableData,
      })
    }
  }
}
