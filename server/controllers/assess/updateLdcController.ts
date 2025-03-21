import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class UpdateLdcController {
  constructor(
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

      return res.render('referrals/updateLdc/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        hasLdc: referral.hasLdc,
        pageHeading: 'Update Learning disabilities and challenges (LDC)',
        person,
      })
    }
  }
}
