import type { Request, Response, TypedRequestHandler } from 'express'

import { withdrawnStatus } from './withdrawCategoryController'
import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

export default class WithdrawReasonController {
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

      if (
        referralStatusUpdateData?.referralId !== referralId ||
        referralStatusUpdateData.status !== withdrawnStatus ||
        !referralStatusUpdateData.statusCategoryCode
      ) {
        return res.redirect(paths.withdraw.category({ referralId }))
      }

      const [statusHistory, statusCodeReasons] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeReasons(
          username,
          referralStatusUpdateData.statusCategoryCode,
          withdrawnStatus,
        ),
      ])

      if (statusCodeReasons.length === 0) {
        return res.redirect(paths.withdraw.reasonInformation({ referralId }))
      }

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        statusCodeReasons,
        req.session.referralStatusUpdateData?.statusReasonCode,
      )

      FormUtils.setFieldErrors(req, res, ['reasonCode'])

      return res.render('referrals/withdraw/reason/show', {
        backLinkHref: paths.withdraw.category({ referralId }),
        cancelLink: paths.show.statusHistory({ referralId }),
        pageHeading: 'Withdrawal reason',
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

      const { referralId } = req.params
      const { reasonCode } = req.body
      const { referralStatusUpdateData } = req.session

      if (!referralStatusUpdateData?.statusCategoryCode) {
        return res.redirect(paths.withdraw.category({ referralId }))
      }

      if (!reasonCode) {
        req.flash('reasonCodeError', 'Select a withdrawal reason')

        return res.redirect(paths.withdraw.reason({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        ...referralStatusUpdateData,
        previousPath: req.path,
        statusReasonCode: reasonCode,
      }

      return res.redirect(paths.withdraw.reasonInformation({ referralId }))
    }
  }
}
