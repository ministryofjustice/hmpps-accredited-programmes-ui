import type { Request, Response, TypedRequestHandler } from 'express'

import { authPaths, referPaths } from '../../../paths'
import type { PersonService, ReferralService } from '../../../services'
import { FormUtils, TypeUtils } from '../../../utils'
import type { ReferralUpdate } from '@accredited-programmes/api'

export default class NewReferralsOasysConfirmationController {
  constructor(
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

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['oasysConfirmed'])

      return res.render('referrals/new/oasysConfirmation/show', {
        pageHeading: 'Confirm the OASys information',
        person,
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
        req.flash('oasysConfirmedError', 'Confirm the OASys information is up to date')

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
