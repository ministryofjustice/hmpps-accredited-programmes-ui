import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseParticipationUtils, CourseUtils, FormUtils, TypeUtils } from '../../utils'
import type { CourseParticipation, ReferralUpdate } from '@accredited-programmes/models'

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

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(referPaths.programmeHistory.new({ referralId: req.params.referralId }))
      }

      const courseParticipation = await this.courseService.createParticipation(
        req.user.token,
        referral.prisonNumber,
        courseName as CourseParticipation['courseName'],
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

      const summaryListOptions = CourseParticipationUtils.summaryListOptions(courseParticipation, referralId, {
        change: false,
        remove: false,
      })

      res.render('referrals/courseParticipations/delete', {
        action: `${referPaths.programmeHistory.destroy({ courseParticipationId, referralId })}?_method=DELETE`,
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

      req.flash('successMessage', 'You have successfully removed a programme.')

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

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

      const { courseName } = courseParticipation
      const isKnownCourse = courses.find(course => course.name === courseName)
      const formValues = isKnownCourse ? { courseName } : { courseName: 'Other', otherCourseName: courseName }
      const hasOtherCourseNameError = !!res.locals.errors.messages.otherCourseName

      res.render('referrals/courseParticipations/course', {
        action: `${referPaths.programmeHistory.updateProgramme({ courseParticipationId, referralId })}?_method=PUT`,
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        formValues,
        otherCourseNameChecked: !isKnownCourse || hasOtherCourseNameError,
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
      const sortedCourseParticipations = (
        await this.courseService.getParticipationsByPerson(req.user.token, person.prisonNumber)
      ).sort((participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt))
      const summaryListsOptions = sortedCourseParticipations.map(participation =>
        CourseParticipationUtils.summaryListOptions(participation, referral.id),
      )

      res.render('referrals/courseParticipations/index', {
        action: `${referPaths.programmeHistory.updateReviewedStatus({ referralId: referral.id })}?_method=PUT`,
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

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

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

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
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

      const { detail, outcome, setting, source } = currentCourseParticipation

      await this.courseService.updateParticipation(req.user.token, currentCourseParticipation.id, {
        courseName: courseName as CourseParticipation['courseName'],
        detail,
        outcome,
        setting,
        source,
      })

      return res.redirect(
        referPaths.programmeHistory.details.show({
          courseParticipationId: req.params.courseParticipationId,
          referralId: req.params.referralId,
        }),
      )
    }
  }

  updateHasReviewedProgrammeHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const hasReviewedProgrammeHistory = req.body.hasReviewedProgrammeHistory === 'true'

      const { oasysConfirmed, reason } = await this.referralService.getReferral(req.user.token, referralId)

      const referralUpdate: ReferralUpdate = {
        hasReviewedProgrammeHistory,
        oasysConfirmed,
        reason,
      }

      await this.referralService.updateReferral(req.user.token, referralId, referralUpdate)

      return res.redirect(referPaths.show({ referralId }))
    }
  }
}
