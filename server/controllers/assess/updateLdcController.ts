import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { FormUtils, TypeUtils } from '../../utils'

export default class UpdateLdcController {
  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { username } = req.user

      const referral = await this.referralService.getReferral(username, referralId)
      const person = await this.personService.getPerson(username, referral.prisonNumber)

      FormUtils.setFieldErrors(req, res, ['ldcReason'])

      return res.render('referrals/updateLdc/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        hasLdc: referral.hasLdc,
        pageHeading: 'Update Learning disabilities and challenges (LDC)',
        person,
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { username } = req.user

      if (!req.body.ldcReason) {
        req.flash('ldcReasonError', 'Select a reason for updating the learning disabilities and challenges status')
        return res.redirect(assessPaths.updateLdc.show({ referralId }))
      }

      const referral = await this.referralService.getReferral(username, referralId)

      const [referralCourse, person] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.personService.getPerson(username, referral.prisonNumber),
        this.referralService.updateReferral(username, referralId, {
          ...referral,
          hasLdcBeenOverriddenByProgrammeTeam: true,
        }),
      ])

      req.flash(
        'ldcStatusChangedMessage',
        `Update: ${person.name} may ${referral.hasLdc ? 'not ' : ''}need an LDC-adapted programme`,
      )

      return res.redirect(assessPaths.caseList.show({ courseId: referralCourse.id, referralStatusGroup: 'open' }))
    }
  }
}
