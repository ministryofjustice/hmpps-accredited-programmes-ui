import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { PersonService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class ReasonController {
  constructor(
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req, res) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, `Person with prison number ${referral.prisonNumber} not found.`)
      }

      res.render('referrals/reason', {
        pageHeading: 'Add reason for referral and any additional information',
        person,
        referral,
      })
    }
  }
}
