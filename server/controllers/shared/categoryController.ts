import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

type SelectCategoryPageContent = Record<
  Uppercase<string>,
  {
    pageDescription: string
    pageHeading: string
    radioLegend: string
  }
>

const content: Partial<SelectCategoryPageContent> = {
  DESELECTED: {
    pageDescription: 'Deselecting someone means they cannot continue the programme. The referral will be closed.',
    pageHeading: 'Deselection category',
    radioLegend: 'Choose the deselection category',
  },
  'DESELECTED|OPEN': {
    pageDescription:
      'Deselecting someone means they cannot continue the programme. The referral will stay open until they can rejoin or restart the programme.',
    pageHeading: 'Deselection category',
    radioLegend: 'Choose the deselection category',
  },
  WITHDRAWN: {
    pageDescription: 'If you withdraw the referral, it will be closed.',
    pageHeading: 'Withdraw referral',
    radioLegend: 'Select the withdrawal category',
  },
}

export default class CategoryController {
  constructor(
    private readonly personService: PersonService,
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
        !referralStatusUpdateData.initialStatusDecision ||
        !content[referralStatusUpdateData.initialStatusDecision]
      ) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const { decisionForCategoryAndReason, initialStatusDecision } = referralStatusUpdateData

      const [referral, statusHistory, categories] = await Promise.all([
        this.referralService.getReferral(username, referralId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeCategories(username, decisionForCategoryAndReason),
      ])

      const person = await this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads)

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        categories,
        referralStatusUpdateData.statusCategoryCode,
      )

      FormUtils.setFieldErrors(req, res, ['categoryCode'])

      return res.render('referrals/updateStatus/category/show', {
        backLinkHref: paths.show.statusHistory({ referralId }),
        person,
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
        ...content[initialStatusDecision],
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
