import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

type SelectCategoryPageContent = Record<
  ReferralStatusUppercase,
  {
    pageDescription: string
    pageHeading: string
    radioLegend: string
  }
>

const content: Partial<SelectCategoryPageContent> = {
  DESELECTED: {
    pageDescription: 'If you deselect the referral, it will be closed.',
    pageHeading: 'Deselection category',
    radioLegend: 'Choose the deselection category',
  },
  WITHDRAWN: {
    pageDescription: 'If you withdraw the referral, it will be closed.',
    pageHeading: 'Withdrawal category',
    radioLegend: 'Select the withdrawal category',
  },
}

export default class CategoryController {
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
        !referralStatusUpdateData.decisionForCategoryAndReason ||
        !content[referralStatusUpdateData.decisionForCategoryAndReason]
      ) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const { decisionForCategoryAndReason } = referralStatusUpdateData

      const [statusHistory, categories] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeCategories(username, decisionForCategoryAndReason),
      ])

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        categories,
        referralStatusUpdateData.statusCategoryCode,
      )

      FormUtils.setFieldErrors(req, res, ['categoryCode'])

      return res.render('referrals/updateStatus/category/show', {
        backLinkHref: '#',
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
        ...content[decisionForCategoryAndReason],
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const paths = this.getPaths(req)
      const { referralId } = req.params
      const { categoryCode } = req.body
      const { referralStatusUpdateData } = req.session

      if (
        referralStatusUpdateData?.referralId !== referralId ||
        !referralStatusUpdateData.decisionForCategoryAndReason
      ) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      if (!categoryCode) {
        req.flash('categoryCodeError', 'Select a category')

        return res.redirect(paths.updateStatus.category.show({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        ...referralStatusUpdateData,
        statusCategoryCode: categoryCode,
        statusReasonCode: undefined,
      }

      return res.redirect(paths.updateStatus.reason.show({ referralId }))
    }
  }

  private getPaths(req: Request) {
    return req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths
  }
}
