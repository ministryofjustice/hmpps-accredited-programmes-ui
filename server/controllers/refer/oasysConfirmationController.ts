import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { FormUtils, TypeUtils } from '../../utils'
import type { ReferralUpdate } from '@accredited-programmes/models'

export default class OasysConfirmationController {
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

      FormUtils.setFieldErrors(req, res, ['oasysConfirmed'])

      res.render('referrals/oasysConfirmation/show', {
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
      const { oasysConfirmed } = req.body

      if (!oasysConfirmed) {
        req.flash('oasysConfirmedError', 'Confirm the OASys information is up to date')

        return res.redirect(referPaths.confirmOasys.show({ referralId }))
      }

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      const referralUpdate: ReferralUpdate = {
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed,
        reason: referral.reason,
      }

      await this.referralService.updateReferral(req.user.token, referralId, referralUpdate)

      return res.redirect(referPaths.show({ referralId }))
    }
  }
}
