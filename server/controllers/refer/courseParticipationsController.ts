import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export default class CourseParticipationsController {
  constructor(private readonly courseService: CourseService) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req, res) => {
      TypeUtils.assertHasUser(req)

      const courses = await this.courseService.getCourses(req.user.token)

      res.render('referrals/courseParticipations/new', {
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        pageHeading: 'Add Accredited Programme history',
      })
    }
  }
}
