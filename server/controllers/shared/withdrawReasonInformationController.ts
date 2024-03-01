import type { Request, Response, TypedRequestHandler } from 'express'

import { withdrawnStatus } from './withdrawCategoryController'
import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { FormUtils, ShowReferralUtils, TypeUtils } from '../../utils'

const maxLength = 100

export default class WithdrawReasonInformationController {
  constructor(private readonly referralService: ReferralService) {}

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

      const statusHistory = await this.referralService.getReferralStatusHistory(userToken, username, referralId)

      FormUtils.setFieldErrors(req, res, ['reasonInformation'])
      FormUtils.setFormValues(req, res)

      return res.render('referrals/withdraw/reason-information/show', {
        backLinkHref: referralStatusUpdateData.previousPath,
        cancelLink: paths.show.statusHistory({ referralId }),
        maxLength,
        pageHeading: 'Withdraw referral',
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const paths = req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

      const { username } = req.user
      const { referralId } = req.params
      const { reasonInformation } = req.body
      const { referralStatusUpdateData } = req.session

      if (!referralStatusUpdateData?.statusCategoryCode) {
        return res.redirect(paths.withdraw.category({ referralId }))
      }

      if (!reasonInformation) {
        req.flash('reasonInformationError', 'Enter withdrawal reason information')

        return res.redirect(paths.withdraw.reasonInformation({ referralId }))
      }

      if (reasonInformation.length > maxLength) {
        req.flash('reasonInformationError', `Withdrawal reason must be ${maxLength} characters or less`)
        req.flash('formValues', [JSON.stringify({ reasonInformation })])

        return res.redirect(paths.withdraw.reasonInformation({ referralId }))
      }

      await this.referralService.updateReferralStatus(username, referralId, {
        category: referralStatusUpdateData.statusCategoryCode,
        notes: reasonInformation,
        reason: referralStatusUpdateData.statusReasonCode,
        status: withdrawnStatus,
      })

      delete req.session.referralStatusUpdateData

      return res.redirect(paths.show.statusHistory({ referralId }))
    }
  }
}
