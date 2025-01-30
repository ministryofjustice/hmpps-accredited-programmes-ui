import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService, PersonService } from '../../services'
import { CourseUtils } from '../../utils'
import type { Person } from '@accredited-programmes/models'
import type { PniScore } from '@accredited-programmes-api'

export default class RecommendedProgrammesController {
  constructor(
    private readonly personService: PersonService,
    private readonly courseSerice: CourseService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const prisonNumber = req.session.pniFindAndReferData?.prisonNumber
      const programmePathway = req.session.pniFindAndReferData?.programmePathway

      if (!prisonNumber || !programmePathway) {
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      const pathwayToIntensityMap: Record<PniScore['programmePathway'], 'HIGH' | 'MODERATE'> = {
        HIGH_INTENSITY_BC: 'HIGH',
        MODERATE_INTENSITY_BC: 'MODERATE',
      }

      const [person, courses] = await Promise.all([
        this.personService.getPerson(res.locals.user.username, prisonNumber),
        this.courseSerice.getCourses(res.locals.user.username, { intensity: pathwayToIntensityMap[programmePathway] }),
      ])

      const coursesToDisplay = courses
        .filter(course => course.displayOnProgrammeDirectory)
        .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
        .map(course => CourseUtils.presentCourse(course))

      return res.render('find/recommendedProgrammes', {
        courses: coursesToDisplay,
        hrefs: {
          back: findPaths.pniFind.recommendedPathway.pattern,
        },
        programmePathway,
        ...this.pageContent(programmePathway, person.name),
      })
    }
  }

  private pageContent(programmePathway: PniScore['programmePathway'], name: Person['name']) {
    if (programmePathway === 'HIGH_INTENSITY_BC') {
      return {
        decisionText: ['These programmes are recommended for people with high or very high risks and needs.'],
        pageHeading: 'Recommended: high intensity Accredited Programmes',
      }
    }

    if (programmePathway === 'MODERATE_INTENSITY_BC') {
      return {
        decisionText: ['These programmes are recommended for people with medium risks and needs.'],
        pageHeading: 'Recommended: moderate intensity Accredited Programmes',
      }
    }

    if (programmePathway === 'ALTERNATIVE_PATHWAY') {
      return {
        decisionText: [
          `Accredited Programmes are not recommended for people who may not be eligible based on risks and needs, like ${name}`,
          'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
        ],
        pageHeading: 'Accredited Programmes: not recommended',
      }
    }

    if (programmePathway === 'MISSING_INFORMATION') {
      return {
        decisionText: [
          `${name} may not be eligible for these programmes based on risks and needs. Information is missing from the risk and need assessment.`,
          'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
        ],
        pageHeading: 'Accredited Programmes',
        warningText: 'Update layer 3 assessment scores',
      }
    }

    return {
      decisionText: [
        `${name} may not be eligible for these programmes based on risks and needs. Information is missing from the layer 3 assessment.`,
        'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.',
      ],
      pageHeading: 'Accredited Programmes',
      warningText: 'Update risk and need assessment scores',
    }
  }
}
