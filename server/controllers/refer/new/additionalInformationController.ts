import type { Request, Response, TypedRequestHandler } from 'express'

import { authPaths, referPaths } from '../../../paths'
import type { PersonService, ReferralService } from '../../../services'
import { FormUtils, TypeUtils } from '../../../utils'
import type { ReferralUpdate } from '@accredited-programmes/models'

const maxLength = 4000

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

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      FormUtils.setFieldErrors(req, res, ['additionalInformation'])
      FormUtils.setFormValues(req, res)

      return res.render('referrals/new/additionalInformation/show', {
        maxLength,
        pageHeading: 'Add additional information',
        person,
        referral,
      })
    }
  }

  update(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let hasErrors = false
      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const formattedAdditionalInformation = req.body.additionalInformation?.trim()

      if (!formattedAdditionalInformation) {
        req.flash('additionalInformationError', 'Enter additional information')
        hasErrors = true
      }

      if (formattedAdditionalInformation?.length > maxLength) {
        req.flash('additionalInformationError', `Additional information must be ${maxLength} characters or fewer`)
        req.flash('formValues', [JSON.stringify({ formattedAdditionalInformation })])
        hasErrors = true
      }

      if (hasErrors) {
        return res.redirect(referPaths.new.additionalInformation.show({ referralId }))
      }

      const referralUpdate: ReferralUpdate = {
        additionalInformation: formattedAdditionalInformation,
        hasReviewedProgrammeHistory: referral.hasReviewedProgrammeHistory,
        oasysConfirmed: referral.oasysConfirmed,
      }

      await this.referralService.updateReferral(req.user.username, referralId, referralUpdate)

      if (req.session.returnTo === 'check-answers') {
        return res.redirect(`${referPaths.new.checkAnswers({ referralId })}#additionalInformation`)
      }

      return res.redirect(referPaths.new.show({ referralId }))
    }
  }
}
