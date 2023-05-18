import type { Request, Response, TypedRequestHandler } from 'express'

import CourseService from '../../services/courseService'
import { courseListItems } from '../../utils/courseUtils'

export default class CoursesController {
  constructor(private readonly courseService: CourseService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (_req: Request, res: Response) => {
      const courses = await this.courseService.getCourses('token')

      res.render('courses/index', {
        pageHeading: 'List of accredited programmes',
        courseListItems: courseListItems(courses),
      })
    }
  }
}
