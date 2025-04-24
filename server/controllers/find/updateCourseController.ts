import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseBody } from './addCourseController'
import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export default class UpdateCourseController {
  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params

      const [audiences, course] = await Promise.all([
        this.courseService.getCourseAudiences(req.user.username),
        this.courseService.getCourse(req.user.username, courseId),
      ])

      const formValues = {
        ...course,
        audienceId: audiences.find(audience => audience.name === course.audience)?.id,
      }

      res.render('courses/form/show', {
        action: `${findPaths.course.update.submit({ courseId })}?_method=PUT`,
        audienceSelectItems: CourseUtils.audienceSelectItems(audiences),
        backLinkHref: findPaths.show({ courseId }),
        formValues,
        pageHeading: 'Update Programme',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params
      const { alternateName, audienceId, description, name, prerequisites, withdrawn } = req.body as CourseBody

      const updatedCourse = await this.courseService.updateCourse(req.user.username, courseId, {
        alternateName,
        audienceId,
        description,
        name,
        withdrawn: withdrawn === 'true',
      })

      if (prerequisites) {
        await this.courseService.updateCoursePrerequisites(
          req.user.username,
          updatedCourse.id,
          Object.values(prerequisites).filter(prerequisite => prerequisite.name && prerequisite.description),
        )
      }

      res.redirect(findPaths.show({ courseId: updatedCourse.id }))
    }
  }
}
