import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

type SelectReasonPageContent = Record<
  ReferralStatusUppercase,
  {
    pageDescription: string
    pageHeading: string
    radioLegend: string
  }
>

const content: Partial<SelectReasonPageContent> = {
  DESELECTED: {
    pageDescription: 'Deselecting someone means they cannot continue the programme. The referral will be closed.',
    pageHeading: 'Deselection reason',
    radioLegend: 'Choose the deselection reason',
  },
  WITHDRAWN: {
    pageDescription: 'If you withdraw the referral, it will be closed.',
    pageHeading: 'Withdrawal reason',
    radioLegend: 'Select the reason for withdrawal',
  },
}

export default class ReasonController {
  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const paths = this.getPaths(req)
      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (
        referralStatusUpdateData?.referralId !== referralId ||
        !referralStatusUpdateData.status ||
        !referralStatusUpdateData.statusCategoryCode ||
        !content[referralStatusUpdateData.status]
      ) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const selectedStatus = referralStatusUpdateData.status

      const [statusHistory, reasons] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeReasons(
          username,
          referralStatusUpdateData.statusCategoryCode,
          selectedStatus,
        ),
      ])

      // Redirect to final page if no options
      if (reasons.length === 0) {
        req.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          statusReasonCode: undefined,
        }

        return res.redirect(paths.updateStatus.selection.show({ referralId }))
      }

      const radioItems = ReferralUtils.statusOptionsToRadioItems(reasons, referralStatusUpdateData.statusReasonCode)

      FormUtils.setFieldErrors(req, res, ['reasonCode'])

      return res.render('referrals/updateStatus/reason/show', {
        backLinkHref: '#',
        cancelLink: paths.show.statusHistory({ referralId }),
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
        ...content[selectedStatus],
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = this.getPaths(req)
      const { referralId } = req.params
      const { reasonCode } = req.body
      const { referralStatusUpdateData } = req.session

      if (!referralStatusUpdateData?.statusCategoryCode) {
        return res.redirect(paths.updateStatus.category.show({ referralId }))
      }

      if (!reasonCode) {
        req.flash('reasonCodeError', 'Select a reason')

        return res.redirect(paths.updateStatus.reason.show({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        ...referralStatusUpdateData,
        statusReasonCode: reasonCode,
      }

      return res.redirect(paths.updateStatus.selection.show({ referralId }))
    }
  }

  private getPaths(req: Request) {
    return req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths
  }
}