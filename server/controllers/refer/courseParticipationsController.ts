import type { Request, Response, TypedRequestHandler } from 'express'

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

      const { courseId, hasFormErrors, otherCourseName } = CourseParticipationUtils.processCourseFormData(
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
        referPaths.programmeHistory.details.show({
          courseParticipationId: courseParticipation.id,
          referralId: referral.id,
        }),
      )
    }
  }

  delete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)
      const referral = await this.referralService.getReferral(req.user.token, referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      const courseParticipationWithName = (
        await this.courseParticipationsWithNames([courseParticipation], req.user.token)
      )[0]

      const summaryListOptions = CourseParticipationUtils.summaryListOptions(
        courseParticipationWithName,
        referralId,
        false,
      )

      res.render('referrals/courseParticipations/delete', {
        pageHeading: 'Remove programme',
        person,
        referralId: referral.id,
        summaryListOptions,
      })
    }
  }

  destroy(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      await this.courseService.deleteParticipation(req.user.token, courseParticipationId)

      return res.redirect(
        referPaths.programmeHistory.index({
          referralId,
        }),
      )
    }
  }

  editCourse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)

      const referral = await this.referralService.getReferral(req.user.token, referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
      const courses = await this.courseService.getCourses(req.user.token)

      FormUtils.setFieldErrors(req, res, ['courseId', 'otherCourseName'])

      const { courseId, otherCourseName } = courseParticipation
      const isOtherCourse = !courseId && !!otherCourseName
      const hasOtherCourseNameError = !!res.locals.errors.messages.otherCourseName

      res.render('referrals/courseParticipations/course', {
        action: `${referPaths.programmeHistory.updateProgramme({ courseParticipationId, referralId })}?_method=PUT`,
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        formValues: { courseId, otherCourseName },
        otherCourseNameChecked: isOtherCourse || hasOtherCourseNameError,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
      })
    }
  }

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const successMessage = req.flash('successMessage')[0]
      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
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
        successMessage,
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

      FormUtils.setFieldErrors(req, res, ['courseId', 'otherCourseName'])

      res.render('referrals/courseParticipations/course', {
        action: referPaths.programmeHistory.create({ referralId: referral.id }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        formValues: {},
        otherCourseNameChecked: !!res.locals.errors.messages.otherCourseName,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
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

      const { courseId, hasFormErrors, otherCourseName } = CourseParticipationUtils.processCourseFormData(
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
        referPaths.programmeHistory.details.show({
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
