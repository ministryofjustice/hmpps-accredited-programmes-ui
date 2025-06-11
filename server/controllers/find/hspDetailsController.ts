import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths, referPaths } from '../../paths'
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
        checkboxFieldsets: ReferenceDataUtils.createSexualOffenceDetailsFieldset(
          groupedDetailOptions,
          req.session.hspReferralData?.selectedOffences,
        ),
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

      const { username } = req.user
      const { courseId } = req.params
      const { sexualOffenceDetails } = req.body as {
        sexualOffenceDetails: Array<string> | string
      }

      const nationalOffering = await this.courseService.getNationalOffering(username, courseId)

      if (!nationalOffering) {
        return res.redirect(findPaths.pniFind.personSearch({}))
      }

      const splitChar = '::'

      const sexualOffenceDetailsArray = Array.isArray(sexualOffenceDetails)
        ? sexualOffenceDetails
        : sexualOffenceDetails
          ? [sexualOffenceDetails]
          : []

      const selectedOffenceValues = sexualOffenceDetailsArray.map(detail => {
        const [id, score] = detail.split(splitChar)
        return { id, score: parseInt(score, 10) }
      })

      const totalScore = selectedOffenceValues.reduce((acc, { score }) => acc + score, 0)

      req.session.hspReferralData = {
        selectedOffences: selectedOffenceValues.map(({ id }) => id),
        totalScore,
      }

      if (totalScore < this.ELIGIBILITY_THRESHOLD_SCORE) {
        return res.redirect(findPaths.hsp.notEligible.show({ courseId }))
      }

      return res.redirect(referPaths.new.start({ courseOfferingId: nationalOffering.id }))
    }
  }
}
