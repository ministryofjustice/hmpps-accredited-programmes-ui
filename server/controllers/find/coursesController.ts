import type { Request, Response, TypedRequestHandler } from 'express'

import type CourseService from '../../services/courseService'
import { courseListItems } from '../../utils/courseUtils'

export default class CoursesController {
  constructor(private readonly courseService: CourseService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const courses = await this.courseService.getCourses(req.user.token)

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courseListItems: courseListItems(courses),
      })
    }
  }
}
