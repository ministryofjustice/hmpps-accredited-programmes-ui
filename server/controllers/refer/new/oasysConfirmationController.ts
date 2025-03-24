import type { Request, Response, TypedRequestHandler } from 'express'

import { authPaths, referPaths } from '../../../paths'
import type { OasysService, PersonService, ReferralService } from '../../../services'
import { DateUtils, FormUtils, TypeUtils } from '../../../utils'
import type { ReferralUpdate } from '@accredited-programmes-api'

export default class NewReferralsOasysConfirmationController {
  constructor(
    private readonly oasysService: OasysService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const [assessmentDateInfo, person] = await Promise.all([
        this.oasysService.getAssessmentDateInfo(req.user.username, referral.prisonNumber),
        this.personService.getPerson(req.user.username, referral.prisonNumber),
      ])

      FormUtils.setFieldErrors(req, res, ['oasysConfirmed'])

      return res.render('referrals/new/oasysConfirmation/show', {
        hasOpenAssessment: assessmentDateInfo?.hasOpenAssessment,
        pageHeading: 'Check risks and needs information (OASys)',
        pageTitleOverride: 'Check risks and needs information',
        person,
        recentCompletedAssessmentDate: assessmentDateInfo?.recentCompletedAssessmentDate
          ? DateUtils.govukFormattedFullDateString(assessmentDateInfo.recentCompletedAssessmentDate)
          : undefined,
        referral,
      })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const { oasysConfirmed } = req.body

      if (!oasysConfirmed) {
        req.flash('oasysConfirmedError', 'Tick the box to confirm the OASys information is up to date')

        return res.redirect(referPaths.new.confirmOasys.show({ referralId }))
      }

      const referralUpdate: ReferralUpdate = {
        additionalInformation: referral.additionalInformation,
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed,
      }

      await this.referralService.updateReferral(req.user.username, referralId, referralUpdate)

      return res.redirect(referPaths.new.show({ referralId }))
    }
  }
}
