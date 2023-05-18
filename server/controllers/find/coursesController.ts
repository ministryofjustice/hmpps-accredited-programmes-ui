import type { Request, Response, TypedRequestHandler } from 'express'

import CourseService from '../../services/courseService'
import { courseListItems } from '../../utils/courseUtils'
import { OrganisationService } from '../../services'

export default class CoursesController {
  constructor(private readonly courseService: CourseService, private readonly organisationService: OrganisationService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const courses = await this.courseService.getCourses('token')
      const organisations = await this.organisationService.getOrganisation(req.user.token, 'BXI')

      console.log(organisations)
      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courseListItems: courseListItems(courses),
      })
    }
  }
}
