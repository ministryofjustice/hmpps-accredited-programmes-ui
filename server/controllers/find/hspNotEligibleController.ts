import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, PersonService } from '../../services'
import { CourseUtils, TypeUtils } from '../../utils'

export default class HspNotEligibleController {
  ELIGIBILITY_THRESHOLD_SCORE = 3

  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
  ) {}

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

      const person = await this.personService.getPerson(username, prisonNumber)

      return res.render('courses/hsp/notEligible/show', {
        hrefs: {
          back: findPaths.hsp.details.show({ courseId: course.id }),
          programmeIndex: findPaths.pniFind.recommendedProgrammes({}),
        },
        pageHeading: `${person.name} may not be eligible for Healthy Sex Programme`,
        pageTitleOverride: 'Not Eligible for HSP',
        personName: person.name,
      })
    }
  }
}
