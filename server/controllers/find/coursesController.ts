import type { Request, Response, TypedRequestHandler } from 'express'

import { CourseService, OrganisationService } from '../../services'
import { courseUtils, organisationUtils, typeUtils } from '../../utils'
import type { CourseOffering, Organisation } from '@accredited-programmes/models'

export default class CoursesController {
  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const courseService = new CourseService(req.user.token)
      const courses = await courseService.getCourses()

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: courses.map(course => courseUtils.presentCourse(course)),
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const courseService = new CourseService(req.user.token)
      const course = await courseService.getCourse(req.params.id)
      const offerings = await courseService.getOfferingsByCourse(course.id)

      const organisationService = new OrganisationService(req.user.token)
      const unresolvedOrganisationPromises = offerings.map((offering: CourseOffering) => {
        return organisationService.getOrganisation(offering.organisationId)
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
