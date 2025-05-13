import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { CourseUtils, FormUtils, TypeUtils } from '../../utils'

export default class HspReferralReasonController {
  MAX_LENGTH = 5000

  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { username } = req.user
      const { courseId } = req.params
      const prisonNumber = req.session.pniFindAndReferData?.prisonNumber
      const programmePathway = req.session.pniFindAndReferData?.programmePathway

      const course = await this.courseService.getCourse(username, courseId)

      if (!prisonNumber || !programmePathway || !CourseUtils.isHsp(course.displayName)) {
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      FormUtils.setFieldErrors(req, res, ['hspReferralReason'])

      return res.render('courses/hsp/reason/show', {
        hrefs: {
          back: findPaths.hsp.notEligible.show({ courseId: course.id }),
        },
        maxLength: this.MAX_LENGTH,
        pageHeading: 'Reason for referral to HSP',
      })
    }
  }
}
