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

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(referPaths.programmeHistory.new({ referralId }))
      }

      const courseParticipation = await this.courseService.createParticipation(
        req.user.token,
        referral.prisonNumber,
        courseName as CourseParticipation['courseName'],
      )

      req.flash('successMessage', 'You have successfully added a programme.')

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

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)
      const courseParticipationPresenter = await this.courseService.presentCourseParticipation(
        req.user.token,
        courseParticipation,
      )
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      const summaryListOptions = CourseParticipationUtils.summaryListOptions(courseParticipationPresenter, referralId, {
        change: false,
        remove: false,
      })

      return res.render('referrals/courseParticipations/delete', {
        action: `${referPaths.programmeHistory.destroy({ courseParticipationId, referralId })}?_method=DELETE`,
        pageHeading: 'Remove programme',
        person,
        referralId,
        summaryListOptions,
      })
    }
  }

  destroy(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

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

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
      const courseNames = await this.courseService.getCourseNames(req.user.token)

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

      const { courseName } = courseParticipation
      const isKnownCourse = courseNames.find(knownCourseName => knownCourseName === courseName)
      const formValues = isKnownCourse ? { courseName } : { courseName: 'Other', otherCourseName: courseName }
      const hasOtherCourseNameError = !!res.locals.errors.messages.otherCourseName

      return res.render('referrals/courseParticipations/course', {
        action: `${referPaths.programmeHistory.updateProgramme({ courseParticipationId, referralId })}?_method=PUT`,
        courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
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

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      const sortedCourseParticipations = await this.courseService.getAndPresentParticipationsByPerson(
        req.user.token,
        person.prisonNumber,
      )

      const summaryListsOptions = sortedCourseParticipations.map(participation =>
        CourseParticipationUtils.summaryListOptions(participation, referralId),
      )

      const successMessage = req.flash('successMessage')[0]

      return res.render('referrals/courseParticipations/index', {
        action: `${referPaths.programmeHistory.updateReviewedStatus({ referralId: referral.id })}?_method=PUT`,
        pageHeading: 'Accredited Programme history',
        person,
        referralId,
        successMessage,
        summaryListsOptions,
      })
    }
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const courseNames = await this.courseService.getCourseNames(req.user.token)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

      return res.render('referrals/courseParticipations/course', {
        action: referPaths.programmeHistory.create({ referralId }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
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

      const { courseParticipationId, referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const currentCourseParticipation = await this.courseService.getParticipation(
        req.user.token,
        courseParticipationId,
      )

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(
          referPaths.programmeHistory.editProgramme({
            courseParticipationId,
            referralId,
          }),
        )
      }

      const { detail, outcome, setting, source } = currentCourseParticipation

      await this.courseService.updateParticipation(req.user.token, courseParticipationId, {
        courseName: courseName as CourseParticipation['courseName'],
        detail,
        outcome,
        setting,
        source,
      })

      req.flash('successMessage', 'You have successfully updated a programme.')

      return res.redirect(
        referPaths.programmeHistory.details.show({
          courseParticipationId,
          referralId,
        }),
      )
    }
  }

  updateHasReviewedProgrammeHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const hasReviewedProgrammeHistory = req.body.hasReviewedProgrammeHistory === 'true'
      const { oasysConfirmed, additionalInformation } = referral

      const referralUpdate: ReferralUpdate = {
        additionalInformation,
        hasReviewedProgrammeHistory,
        oasysConfirmed,
      }

      await this.referralService.updateReferral(req.user.token, referralId, referralUpdate)

      return res.redirect(referPaths.show({ referralId }))
    }
  }
}
