import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { ReferralUpdate } from '@accredited-programmes/models'

export default class ReasonController {
  constructor(
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      ReferralUtils.redirectIfSubmitted(referral, res)

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['reason'])

      res.render('referrals/reason/show', {
        pageHeading: 'Add reason for referral and any additional information',
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
      ReferralUtils.redirectIfSubmitted(referral, res)

      const formattedReason = req.body.reason?.trim()

      if (!formattedReason) {
        req.flash('reasonError', 'Enter a reason for the referral')

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
