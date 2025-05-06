import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatusWithReasons } from '@accredited-programmes/models'

type SelectReasonPageContent = Record<
  Uppercase<string>,
  {
    pageDescription: string
    pageHeading: string
  }
>

const content: Partial<SelectReasonPageContent> = {
  ASSESSED_SUITABLE: {
    pageDescription:
      'This referral does not match the recommended programme pathway based on the risk and programme needs identifier (PNI) scores.',
    pageHeading: 'Reason why the referral does not match the PNI',
  },
  DESELECTED: {
    pageDescription: 'Deselecting someone means they cannot continue the programme. The referral will be closed.',
    pageHeading: 'Deselection reason',
  },
  'DESELECTED|OPEN': {
    pageDescription:
      'Deselecting someone means they cannot continue the programme. The referral will stay open until they can rejoin or restart the programme.',
    pageHeading: 'Deselection reason',
  },
  WITHDRAWN: {
    pageDescription: 'If you withdraw the referral, it will be closed.',
    pageHeading: 'Withdrawal reason',
  },
}

export default class ReasonController {
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

      const [referral, statusHistory, reasons] = await Promise.all([
        this.referralService.getReferral(username, referralId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeReasonsWithCategory(
          username,
          decisionForCategoryAndReason as ReferralStatusWithReasons,
          { deselectAndKeepOpen: initialStatusDecision === 'DESELECTED|OPEN' },
        ),
      ])

      const person = await this.personService.getPerson(username, referral.prisonNumber)

      const groupedReasons = ReferralUtils.groupReasonsByCategory(reasons)
      const reasonsFieldsets = ReferralUtils.createReasonsFieldset(
        groupedReasons,
        referralStatusUpdateData.statusReasonCode,
      )

      FormUtils.setFieldErrors(req, res, ['reasonCode'])

      return res.render('referrals/updateStatus/reason/show', {
        backLinkHref: paths.show.statusHistory({ referralId }),
        person,
        reasonsFieldsets,
        showOther: referralStatusUpdateData.initialStatusDecision !== 'ASSESSED_SUITABLE',
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
        ...content[initialStatusDecision],
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const paths = this.getPaths(req)
      const { referralId } = req.params
      let { reasonCode } = req.body
      const { referralStatusUpdateData } = req.session

      if (!referralStatusUpdateData?.decisionForCategoryAndReason) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const { decisionForCategoryAndReason } = referralStatusUpdateData

      if (!reasonCode) {
        req.flash(
          'reasonCodeError',
          decisionForCategoryAndReason === 'DESELECTED' ? 'Select a deselection reason' : 'Select a withdrawal reason',
        )

        return res.redirect(paths.updateStatus.reason.show({ referralId }))
      }

      const reasons = await this.referenceDataService.getReferralStatusCodeReasonsWithCategory(
        req.user.username,
        decisionForCategoryAndReason as ReferralStatusWithReasons,
      )

      let categoryCode = reasons.find(reason => reason.code === reasonCode)?.referralCategoryCode as Uppercase<string>

      if (reasonCode === 'OTHER') {
        categoryCode = decisionForCategoryAndReason === 'DESELECTED' ? 'D_OTHER' : 'W_OTHER'
        reasonCode = undefined
      }

      req.session.referralStatusUpdateData = {
        ...referralStatusUpdateData,
        statusCategoryCode: categoryCode,
        statusReasonCode: reasonCode,
      }

      if (referralStatusUpdateData.initialStatusDecision === 'DESELECTED|OPEN') {
        return res.redirect(`${assessPaths.updateStatus.decision.show({ referralId })}?deselectAndKeepOpen=true`)
      }

      return res.redirect(paths.updateStatus.selection.show({ referralId }))
    }
  }

  private getPaths(req: Request) {
    return req.path.startsWith(assessPathBase.pattern) ? assessPaths : referPaths
  }
}
