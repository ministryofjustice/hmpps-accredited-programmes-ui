import type { Request, Response, TypedRequestHandler } from 'express'

import { referPaths } from '../../../paths'
import type { PersonService, ReferralService } from '../../../services'
import { TypeUtils } from '../../../utils'

export default class NewReferralsDeleteController {
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
        return res.redirect(referPaths.show.personalDetails({ referralId }))
      }

      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      return res.render('referrals/new/delete/show', {
        action: `${referPaths.new.delete({ referralId })}?_method=DELETE`,
        hrefs: { back: referPaths.new.show({ referralId }) },
        pageHeading: 'Delete draft referral?',
        person,
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)
      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      await this.referralService.deleteReferral(req.user.username, referralId)

      req.flash('draftReferralDeletedMessage', `Draft referral for ${person.name} deleted.`)

      return res.redirect(referPaths.caseList.show({ referralStatusGroup: 'draft' }))
    }
  }
}
