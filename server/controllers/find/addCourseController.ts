import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export interface CourseBody {
  _csrf: string
  alternateName: string
  audienceId: string
  description: string
  name: string
  prerequisites: Record<
    string,
    {
      description: string
      name: string
    }
  >
  withdrawn: string
}

export default class AddCourseController {
  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const audiences = await this.courseService.getCourseAudiences(req.user.username)

      res.render('courses/form/show', {
        action: findPaths.course.add.create({}),
        audienceSelectItems: CourseUtils.audienceSelectItems(audiences),
        backLinkHref: findPaths.index({}),
        pageHeading: 'Add a Programme',
      })
    }
  }

  submit(): TypedRequestHandler<Request<unknown, unknown, CourseBody>, Response> {
    return async (req: Request<unknown, unknown, CourseBody>, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { alternateName, audienceId, description, name, prerequisites, withdrawn } = req.body

      const createdCourse = await this.courseService.createCourse(req.user.username, {
        alternateName,
        audienceId,
        description,
        name,
        withdrawn: withdrawn === 'true',
      })

      if (prerequisites) {
        await this.courseService.updateCoursePrerequisites(
          req.user.username,
          createdCourse.id,
          Object.values(prerequisites).filter(prerequisite => prerequisite.name && prerequisite.description),
        )
      }

      res.redirect(findPaths.show({ courseId: createdCourse.id }))
    }
  }
}
