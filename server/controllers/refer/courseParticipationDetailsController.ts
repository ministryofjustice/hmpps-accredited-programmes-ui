import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { CourseParticipationUtils, FormUtils, TypeUtils } from '../../utils'

export default class CourseParticipationDetailsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)
      const { courseParticipationId, referralId } = req.params

      const { outcome, setting, source } = await this.courseService.getParticipation(
        req.user.token,
        courseParticipationId,
      )

      const referral = await this.referralService.getReferral(req.user.token, referralId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['yearCompleted', 'yearStarted'])
      FormUtils.setFormValues(req, res, {
        outcome,
        setting: {
          ...setting,
          communityLocation: setting.type === 'community' ? setting.location : '',
          custodyLocation: setting.type === 'custody' ? setting.location : '',
        },
        source,
      })

      res.render('referrals/courseParticipations/details/show', {
        action: `${referPaths.programmeHistory.details.update({ courseParticipationId, referralId })}?_method=PUT`,
        backLinkHref: referPaths.programmeHistory.editProgramme({ courseParticipationId, referralId }),
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

      const courseParticipation = await this.courseService.getParticipation(req.user.token, courseParticipationId)

      const processedFormData = CourseParticipationUtils.processDetailsFormData(req)

      if (processedFormData.hasFormErrors) {
        return res.redirect(referPaths.programmeHistory.details.show({ courseParticipationId, referralId }))
      }

      await this.courseService.updateParticipation(req.user.token, courseParticipationId, {
        courseId: courseParticipation.courseId,
        otherCourseName: courseParticipation.otherCourseName,
        ...processedFormData.courseParticipationUpdate,
      })

      req.flash('successMessage', 'You have successfully added a programme.')

      return res.redirect(referPaths.programmeHistory.index({ referralId }))
    }
  }
}
