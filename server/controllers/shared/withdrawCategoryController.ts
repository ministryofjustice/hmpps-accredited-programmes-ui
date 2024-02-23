import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class WithdrawCategoryController {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const paths = req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

      const { referralId } = req.params
      const { token: userToken, username } = req.user

      await this.referralService.getReferral(username, referralId)

      const [statusHistory, withdrawalCategories] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeCategories(username, 'WITHDRAWN'),
      ])

      const radioItems = ReferralUtils.statusCategoriesToRadioItems(withdrawalCategories)

      FormUtils.setFieldErrors(req, res, ['categoryCode'])

      return res.render('referrals/withdraw/category/show', {
        action: paths.withdraw.category({ referralId }),
        backLinkHref: paths.show.statusHistory({ referralId }),
        pageHeading: 'Withdrawal category',
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

      const { referralId } = req.params
      const { categoryCode } = req.body

      if (!categoryCode) {
        req.flash('categoryCodeError', 'Select a withdrawal category')

        return res.redirect(paths.withdraw.category({ referralId }))
      }

      return res.redirect(`${paths.withdraw.reason({ referralId })}?categoryCode=${categoryCode}`)
    }
  }
}
