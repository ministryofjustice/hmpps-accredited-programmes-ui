import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseParticipationUtils, CourseUtils, TypeUtils } from '../../utils'
import type { CourseParticipation, CourseParticipationWithName } from '@accredited-programmes/models'

export default class CourseParticipationsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  create(): TypedRequestHandler<Request, Response> {
    return async (req, res) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      const { courseId, otherCourseName } = req.body

      const courseParticipation = await this.courseService.createParticipation(
        req.user.token,
        referral.prisonNumber,
        courseId === 'other' ? undefined : courseId,
        courseId === 'other' ? otherCourseName : undefined,
      )

      return res.redirect(
        referPaths.programmeHistory.details({ courseParticipationId: courseParticipation.id, referralId: referral.id }),
      )
    }
  }

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      const courseParticipations = await this.courseService.getParticipationsByPerson(
        req.user.token,
        person.prisonNumber,
      )

      const courseParticipationsWithNames = await this.courseParticipationsWithNames(
        courseParticipations,
        req.user.token,
      )

      const summaryListsOptions = courseParticipationsWithNames.map(CourseParticipationUtils.summaryListOptions)

      res.render('referrals/courseParticipations/index', {
        pageHeading: 'Accredited Programme history',
        person,
        referralId: referral.id,
        summaryListsOptions,
      })
    }
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req, res) => {
      TypeUtils.assertHasUser(req)

      const courses = await this.courseService.getCourses(req.user.token)
      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      if (!person) {
        throw createError(404, `Person with prison number ${referral.prisonNumber} not found.`)
      }

      res.render('referrals/courseParticipations/new', {
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        pageHeading: 'Add Accredited Programme history',
        person,
      })
    }
  }

  private async courseParticipationsWithNames(
    courseParticipations: Array<CourseParticipation>,
    token: Express.User['token'],
  ): Promise<Array<CourseParticipationWithName>> {
    return Promise.all(
      courseParticipations.map(async courseParticipation => {
        let name = ''

        if (courseParticipation.courseId) {
          const course = await this.courseService.getCourse(token, courseParticipation.courseId)
          name = course.name
        } else {
          name = courseParticipation.otherCourseName as CourseParticipationWithName['name']
        }

        return { ...courseParticipation, name }
      }),
    )
  }
}
