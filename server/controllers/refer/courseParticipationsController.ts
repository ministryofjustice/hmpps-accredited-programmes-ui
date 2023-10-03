import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseParticipationUtils, CourseUtils, FormUtils, TypeUtils } from '../../utils'
import type { CourseParticipation, CourseParticipationWithName } from '@accredited-programmes/models'

export default class CourseParticipationsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      const { courseId, hasFormErrors, otherCourseName } = CourseParticipationUtils.processedCourseFormData(
        req.body.courseId,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(referPaths.programmeHistory.new({ referralId: req.params.referralId }))
      }

      const courseParticipation = await this.courseService.createParticipation(
        req.user.token,
        referral.prisonNumber,
        courseId,
        otherCourseName,
      )

      return res.redirect(
        referPaths.programmeHistory.details({ courseParticipationId: courseParticipation.id, referralId: referral.id }),
      )
    }
  }

  editCourse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)

      if (!courseParticipation) {
        throw createError(404, `Programme history with ID ${courseParticipationId} not found.`)
      }

      const referral = await this.referralService.getReferral(req.user.token, referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      if (!person) {
        throw createError(404, `Person with prison number ${referral.prisonNumber} not found.`)
      }

      const courses = await this.courseService.getCourses(req.user.token)

      FormUtils.setFieldErrors(req, res, ['courseId', 'otherCourseName'])

      const isOtherCourse = !courseParticipation?.courseId && !!courseParticipation?.otherCourseName
      const hasOtherCourseNameError = !!res.locals.errors.messages.otherCourseName

      res.render('referrals/courseParticipations/course', {
        action: `${referPaths.programmeHistory.updateProgramme({ courseParticipationId, referralId })}?_method=PUT`,
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        otherCourseNameChecked: isOtherCourse || hasOtherCourseNameError,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
        values: {
          courseId: courseParticipation?.courseId,
          otherCourseName: courseParticipation?.otherCourseName,
        },
      })
    }
  }

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

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

      const summaryListsOptions = courseParticipationsWithNames.map(courseParticipationWithName =>
        CourseParticipationUtils.summaryListOptions(courseParticipationWithName, referral.id),
      )

      res.render('referrals/courseParticipations/index', {
        pageHeading: 'Accredited Programme history',
        person,
        referralId: referral.id,
        summaryListsOptions,
      })
    }
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const courses = await this.courseService.getCourses(req.user.token)
      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      if (!person) {
        throw createError(404, `Person with prison number ${referral.prisonNumber} not found.`)
      }

      FormUtils.setFieldErrors(req, res, ['courseId', 'otherCourseName'])

      res.render('referrals/courseParticipations/course', {
        action: referPaths.programmeHistory.create({ referralId: referral.id }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        otherCourseNameChecked: !!res.locals.errors.messages.otherCourseName,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
        values: {},
      })
    }
  }

  updateCourse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const currentCourseParticipation = await this.courseService.getParticipation(
        req.user.token,
        req.params.courseParticipationId,
      )

      if (!currentCourseParticipation) {
        throw createError(404, `Programme history with ID ${req.params.courseParticipationId} not found.`)
      }

      const { courseId, hasFormErrors, otherCourseName } = CourseParticipationUtils.processedCourseFormData(
        req.body.courseId,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(
          referPaths.programmeHistory.editProgramme({
            courseParticipationId: currentCourseParticipation.id,
            referralId: req.params.referralId,
          }),
        )
      }

      await this.courseService.updateParticipation(req.user.token, currentCourseParticipation.id, {
        ...currentCourseParticipation,
        courseId,
        otherCourseName,
      })

      return res.redirect(
        referPaths.programmeHistory.details({
          courseParticipationId: req.params.courseParticipationId,
          referralId: req.params.referralId,
        }),
      )
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
