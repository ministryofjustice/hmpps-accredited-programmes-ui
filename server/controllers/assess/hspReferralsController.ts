import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService } from '../../services'
import { TypeUtils } from '../../utils'

export default class HspReferralsController {
  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const courses = await this.courseService.getCourses(req.user.username, { intensity: 'HIGH' })
      const hspCourse = courses.find(course => course.name === 'Healthy Sex Programme')
      if (hspCourse) {
        return res.redirect(assessPaths.caseList.show({ courseId: hspCourse.id, referralStatusGroup: 'open' }))
      }

      return res.redirect('/')
    }
  }
}
