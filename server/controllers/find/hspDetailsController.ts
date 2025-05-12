import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, PersonService, ReferenceDataService } from '../../services'
import { CourseUtils, FormUtils, ReferenceDataUtils, TypeUtils } from '../../utils'

export default class HspDetailsController {
  ELIGIBILITY_THRESHOLD_SCORE = 3

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

      FormUtils.setFieldErrors(req, res, ['sexualOffenceDetails'])

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

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId } = req.params
      const { sexualOffenceDetails } = req.body

      if (!sexualOffenceDetails) {
        req.flash('sexualOffenceDetailsError', 'Please select at least one sexual offence')

        return res.redirect(findPaths.hsp.details.show({ courseId }))
      }

      const splitChar = '::'
      const selectedValues = Array.isArray(sexualOffenceDetails)
        ? sexualOffenceDetails.map(detail => detail.split(splitChar))
        : [sexualOffenceDetails.split(splitChar)]

      const totalScore = selectedValues.reduce((acc, [_value, score]) => acc + parseInt(score, 10), 0)

      if (totalScore < this.ELIGIBILITY_THRESHOLD_SCORE) {
        return res.send('Ineligible')
      }

      return res.send('Eligible')
    }
  }
}
