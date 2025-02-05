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
      const { override } = req.query
      const isOverride = override === 'true'
      const prisonNumber = req.session.pniFindAndReferData?.prisonNumber
      const programmePathway = req.session.pniFindAndReferData?.programmePathway
      let overridePathway: PniScore['programmePathway'] | undefined

      if (!prisonNumber || !programmePathway) {
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      if (isOverride) {
        const pathwayOverrideMap: Record<PniScore['programmePathway'], PniScore['programmePathway']> = {
          HIGH_INTENSITY_BC: 'MODERATE_INTENSITY_BC',
          MODERATE_INTENSITY_BC: 'HIGH_INTENSITY_BC',
        }

        overridePathway = pathwayOverrideMap[programmePathway]
      }

      const pathwayIntensityMap: Record<PniScore['programmePathway'], 'HIGH' | 'MODERATE'> = {
        HIGH_INTENSITY_BC: 'HIGH',
        MODERATE_INTENSITY_BC: 'MODERATE',
      }

      const [person, courses] = await Promise.all([
        this.personService.getPerson(res.locals.user.username, prisonNumber),
        this.courseSerice.getCourses(res.locals.user.username, {
          intensity: pathwayIntensityMap[overridePathway || programmePathway],
        }),
      ])

      const coursesToDisplay = courses
        .filter(course => course.displayOnProgrammeDirectory)
        .sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))
        .map(course => CourseUtils.presentCourse(course))

      return res.render('find/recommendedProgrammes', {
        courses: coursesToDisplay,
        hrefs: {
          back: findPaths.pniFind.recommendedPathway.pattern,
          self: findPaths.pniFind.recommendedProgrammes.pattern,
        },
        programmePathway,
        ...this.pageContent(programmePathway, person.name, isOverride),
      })
    }
  }

  private pageContent(programmePathway: PniScore['programmePathway'], name: Person['name'], isOverride: boolean) {
    const overrideText =
      'You can make a referral anyway and the treatment manager will decide whether an override is appropriate. You will need to give a reason before you submit the referral.'

    if (programmePathway === 'HIGH_INTENSITY_BC') {
      return {
        canBeOverridden: true,
        decisionText: isOverride
          ? [`These programmes are not recommended for people with high risks and needs, like ${name}`, overrideText]
          : ['These programmes are recommended for people with high or very high risks and needs.'],
        isOverride,
        overrideButtonText: 'See moderate intensity programmes',
        pageHeading: isOverride
          ? 'Not recommended: moderate intensity Accredited Programmes'
          : 'Recommended: high intensity Accredited Programmes',
      }
    }

    if (programmePathway === 'MODERATE_INTENSITY_BC') {
      return {
        canBeOverridden: true,
        decisionText: isOverride
          ? [`These programmes are not recommended for people with medium risks and needs, like ${name}`, overrideText]
          : ['These programmes are recommended for people with medium risks and needs.'],
        isOverride,
        overrideButtonText: 'See high intensity programmes',
        pageHeading: isOverride
          ? 'Not recommended: high intensity Accredited Programmes'
          : 'Recommended: moderate intensity Accredited Programmes',
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
