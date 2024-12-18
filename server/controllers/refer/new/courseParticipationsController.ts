import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../../paths'
import type { CourseService, PersonService, ReferralService } from '../../../services'
import { CourseParticipationUtils, CourseUtils, FormUtils, TypeUtils } from '../../../utils'
import type { CourseParticipation, ReferralUpdate } from '@accredited-programmes/models'

export default class NewReferralsCourseParticipationsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(referPaths.new.programmeHistory.new({ referralId }))
      }

      const courseParticipation = await this.courseService.createParticipation(
        req.user.username,
        referral.prisonNumber,
        courseName as CourseParticipation['courseName'],
      )

      req.flash('successMessage', 'You have successfully added a programme.')

      return res.redirect(
        referPaths.new.programmeHistory.details.show({
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const courseParticipation = await this.courseService.getParticipation(req.user.username, courseParticipationId)
      const summaryListOptions = await this.courseService.presentCourseParticipation(
        req.user.token,
        courseParticipation,
        referralId,
        undefined,
        { change: false, remove: false },
      )
      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      return res.render('referrals/new/courseParticipations/delete', {
        action: `${referPaths.new.programmeHistory.destroy({ courseParticipationId, referralId })}?_method=DELETE`,
        hideTitleServiceName: true,
        pageHeading: 'Remove programme',
        pageTitleOverride: 'Delete Accredited Programme history',
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      await this.courseService.deleteParticipation(req.user.username, courseParticipationId)

      req.flash('successMessage', 'You have successfully removed a programme.')

      return res.redirect(
        referPaths.new.programmeHistory.index({
          referralId,
        }),
      )
    }
  }

  editCourse(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const courseParticipation = await this.courseService.getParticipation(req.user.username, courseParticipationId)
      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)
      const courseNames = await this.courseService.getCourseNames(req.user.username)

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

      const { courseName } = courseParticipation
      const isKnownCourse = courseNames.find(knownCourseName => knownCourseName === courseName)
      const formValues = isKnownCourse ? { courseName } : { courseName: 'Other', otherCourseName: courseName }
      const hasOtherCourseNameError = !!res.locals.errors.messages.otherCourseName

      return res.render('referrals/new/courseParticipations/course', {
        action: `${referPaths.new.programmeHistory.updateProgramme({ courseParticipationId, referralId })}?_method=PUT`,
        courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
        formValues,
        hideTitleServiceName: true,
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      const summaryListsOptions = await this.courseService.getAndPresentParticipationsByPerson(
        req.user.username,
        req.user.token,
        person.prisonNumber,
        referralId,
      )

      const successMessage = req.flash('successMessage')[0]

      const historyText = summaryListsOptions.length
        ? `The history shows ${person.name} has previously started or completed an Accredited Programme.`
        : `There is no record of Accredited Programmes for ${person.name}.`

      return res.render('referrals/new/courseParticipations/index', {
        action: `${referPaths.new.programmeHistory.updateReviewedStatus({ referralId: referral.id })}?_method=PUT`,
        hideTitleServiceName: true,
        historyText,
        pageHeading: 'Accredited Programme history',
        pageTitleOverride: "Person's Accredited Programme history",
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const courseNames = await this.courseService.getCourseNames(req.user.username)
      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      FormUtils.setFieldErrors(req, res, ['courseName', 'otherCourseName'])

      return res.render('referrals/new/courseParticipations/course', {
        action: referPaths.new.programmeHistory.create({ referralId }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
        formValues: {},
        hideTitleServiceName: true,
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const currentCourseParticipation = await this.courseService.getParticipation(
        req.user.username,
        courseParticipationId,
      )

      const { courseName, hasFormErrors } = CourseParticipationUtils.processCourseFormData(
        req.body.courseName,
        req.body.otherCourseName,
        req,
      )

      if (hasFormErrors) {
        return res.redirect(
          referPaths.new.programmeHistory.editProgramme({
            courseParticipationId,
            referralId,
          }),
        )
      }

      const { detail, outcome, setting, source } = currentCourseParticipation

      await this.courseService.updateParticipation(req.user.username, courseParticipationId, {
        courseName: courseName as CourseParticipation['courseName'],
        detail,
        outcome,
        setting,
        source,
      })

      req.flash('successMessage', 'You have successfully updated a programme.')

      return res.redirect(
        referPaths.new.programmeHistory.details.show({
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

      const referral = await this.referralService.getReferral(req.user.username, req.params.referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const hasReviewedProgrammeHistory = req.body.hasReviewedProgrammeHistory === 'true'
      const { oasysConfirmed, additionalInformation } = referral

      const referralUpdate: ReferralUpdate = {
        additionalInformation,
        hasReviewedProgrammeHistory,
        oasysConfirmed,
      }

      await this.referralService.updateReferral(req.user.username, referralId, referralUpdate)

      return res.redirect(referPaths.new.show({ referralId }))
    }
  }
}
