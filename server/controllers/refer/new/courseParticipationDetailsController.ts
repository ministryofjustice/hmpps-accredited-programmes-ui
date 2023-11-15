import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../../paths'
import type { CourseService, PersonService, ReferralService } from '../../../services'
import { CourseParticipationUtils, FormUtils, TypeUtils } from '../../../utils'

export default class NewReferralsCourseParticipationDetailsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { courseParticipationId, referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const { detail, outcome, setting, source } = await this.courseService.getParticipation(
        req.user.username,
        courseParticipationId,
      )

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['yearCompleted', 'yearStarted'])
      FormUtils.setFormValues(req, res, {
        detail,
        outcome,
        setting: {
          ...setting,
          communityLocation: setting?.type === 'community' ? setting.location : '',
          custodyLocation: setting?.type === 'custody' ? setting.location : '',
        },
        source,
      })

      return res.render('referrals/new/courseParticipations/details/show', {
        action: `${referPaths.new.programmeHistory.details.update({ courseParticipationId, referralId })}?_method=PUT`,
        backLinkHref: referPaths.new.programmeHistory.editProgramme({ courseParticipationId, referralId }),
        courseParticipationId,
        pageHeading: 'Add Accredited Programme details',
        person,
        referralId,
      })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseParticipationId, referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const courseParticipation = await this.courseService.getParticipation(req.user.username, courseParticipationId)

      const processedFormData = CourseParticipationUtils.processDetailsFormData(req, courseParticipation.courseName)

      if (processedFormData.hasFormErrors) {
        return res.redirect(referPaths.new.programmeHistory.details.show({ courseParticipationId, referralId }))
      }

      await this.courseService.updateParticipation(
        req.user.username,
        courseParticipationId,
        processedFormData.courseParticipationUpdate,
      )

      req.flash('successMessage', 'You have successfully updated a programme.')

      return res.redirect(referPaths.new.programmeHistory.index({ referralId }))
    }
  }
}
