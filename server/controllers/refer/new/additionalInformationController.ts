import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../../paths'
import type { PersonService, ReferralService } from '../../../services'
import { FormUtils, TypeUtils } from '../../../utils'
import type { ReferralUpdate } from '@accredited-programmes/models'

export default class NewReferralsAdditionalInformationController {
  constructor(
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, req.params.referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['additionalInformation'])

      return res.render('referrals/new/additionalInformation/show', {
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

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      const formattedAdditionalInformation = req.body.additionalInformation?.trim()

      if (!formattedAdditionalInformation) {
        req.flash('additionalInformationError', 'Enter additional information')

        return res.redirect(referPaths.new.additionalInformation.show({ referralId }))
      }

      const referralUpdate: ReferralUpdate = {
        additionalInformation: formattedAdditionalInformation,
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed: referral.oasysConfirmed,
      }

      await this.referralService.updateReferral(req.user.username, referralId, referralUpdate)

      return res.redirect(referPaths.new.show({ referralId }))
    }
  }
}
