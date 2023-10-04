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

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
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

      const formattedReason = req.body.reason?.trim()

      if (!formattedReason) {
        req.flash('reasonError', 'Enter a reason for the referral')

        return res.redirect(referPaths.reason.show({ referralId: req.params.referralId }))
      }

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      const referralUpdate: ReferralUpdate = {
        oasysConfirmed: referral.oasysConfirmed,
        reason: formattedReason,
      }

      await this.referralService.updateReferral(req.user.token, referral.id, referralUpdate)

      return res.redirect(referPaths.show({ referralId: referral.id }))
    }
  }
}
