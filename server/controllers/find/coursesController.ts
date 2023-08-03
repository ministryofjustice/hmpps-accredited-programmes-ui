import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OrganisationService } from '../../services'
import { courseUtils, organisationUtils, typeUtils } from '../../utils'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'

export default class CoursesController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
  ) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const courses = await this.courseService.getCourses(req.user.token)

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: courses
          .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
          .map(course => courseUtils.presentCourse(course)),
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const course = await this.courseService.getCourse(req.user.token, req.params.courseId)
      const offerings = await this.courseService.getOfferingsByCourse(req.user.token, course.id)

      const unresolvedOrganisationPromises = offerings.map((offering: CourseOffering) => {
        return this.organisationService.getOrganisation(req.user.token, offering.organisationId)
      })

      const organisations: Array<Organisation> = (await Promise.all(unresolvedOrganisationPromises)).filter(
        typeUtils.isNotNull<Organisation>,
      )

      const organisationsWithOfferingIds = organisations.map(organisation => {
        const courseOffering = offerings.find(offering => offering.organisationId === organisation.id) as CourseOffering
        return { ...organisation, courseOfferingId: courseOffering.id }
      })

      const organisationsTableData = organisationUtils.organisationTableRows(course, organisationsWithOfferingIds)

      const coursePresenter = courseUtils.presentCourse(course)

      res.render('courses/show', {
        pageHeading: coursePresenter.nameAndAlternateName,
        course: coursePresenter,
        organisationsTableData,
      })
    }
  }
}
