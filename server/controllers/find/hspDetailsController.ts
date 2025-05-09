import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, PersonService, ReferenceDataService } from '../../services'
import { CourseUtils, ReferenceDataUtils, TypeUtils } from '../../utils'

export default class HspDetailsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referenceDataService: ReferenceDataService,
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

      const [person, details] = await Promise.all([
        this.personService.getPerson(username, prisonNumber),
        this.referenceDataService.getSexualOffenceDetails(username),
      ])

      const groupedDetailOptions = ReferenceDataUtils.groupOptionsByKey(details, 'categoryDescription')

      return res.render('courses/hsp/details/show', {
        checkboxFieldsets: ReferenceDataUtils.createSexualOffenceDetailsFieldset(groupedDetailOptions, []),
        hrefs: {
          back: findPaths.show({ courseId: course.id }),
          programmeIndex: findPaths.pniFind.recommendedProgrammes({}),
        },
        pageHeading: 'Sexual offence details',
        personName: person.name,
      })
    }
  }
}
