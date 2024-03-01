import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export const withdrawnStatus = 'WITHDRAWN'
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
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId || referralStatusUpdateData.status !== withdrawnStatus) {
        delete req.session.referralStatusUpdateData
      }

      const [statusHistory, withdrawalCategories] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeCategories(username, withdrawnStatus),
      ])

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        withdrawalCategories,
        req.session.referralStatusUpdateData?.statusCategoryCode,
      )

      FormUtils.setFieldErrors(req, res, ['categoryCode'])

      return res.render('referrals/withdraw/category/show', {
        backLinkHref: referralStatusUpdateData?.previousPath || paths.show.statusHistory({ referralId }),
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

      req.session.referralStatusUpdateData = {
        previousPath: req.path,
        referralId,
        status: withdrawnStatus,
        statusCategoryCode: categoryCode,
        statusReasonCode: undefined,
      }

      return res.redirect(paths.withdraw.reason({ referralId }))
    }
  }
}
