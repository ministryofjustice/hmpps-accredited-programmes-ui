import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { FormUtils, TypeUtils } from '../../utils'
import type { ReferralUpdate } from '@accredited-programmes/models'

export default class ReasonController {
  constructor(
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['reason'])

      return res.render('referrals/reason/show', {
        pageHeading: 'Add additional information',
        person,
        referral,
      })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.complete({ referralId }))
      }

      const formattedReason = req.body.reason?.trim()

      if (!formattedReason) {
        req.flash('reasonError', 'Enter additional information')

        return res.redirect(referPaths.reason.show({ referralId }))
      }

      const referralUpdate: ReferralUpdate = {
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed: referral.oasysConfirmed,
        reason: formattedReason,
      }

      await this.referralService.updateReferral(req.user.token, referralId, referralUpdate)

      return res.redirect(referPaths.show({ referralId }))
    }
  }
}
