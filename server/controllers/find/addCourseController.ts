import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export default class AddCourseController {
  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const audiences = await this.courseService.getCourseAudiences(req.user.token)

      res.render('courses/form/show', {
        audienceSelectItems: CourseUtils.audienceSelectItems(audiences),
        pageHeading: 'Add a Programme',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { audienceId, name, alternateName, description, withdrawn } = req.body as Record<string, string>

      const createdCourse = await this.courseService.createCourse(req.user.username, {
        alternateName,
        audienceId,
        description,
        name,
        withdrawn: withdrawn === 'true',
      })

      res.redirect(findPaths.show({ courseId: createdCourse.id }))
    }
  }
}
