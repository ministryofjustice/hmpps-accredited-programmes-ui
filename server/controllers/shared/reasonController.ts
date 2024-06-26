import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'

type SelectReasonPageContent = Record<
  Uppercase<string>,
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
  'DESELECTED|OPEN': {
    pageDescription:
      'Deselecting someone means they cannot continue the programme. The referral will stay open until they can rejoin or restart the programme.',
    pageHeading: 'Deselection reason',
    radioLegend: 'Choose the deselection reason',
  },
  WITHDRAWN: {
    pageDescription: 'If you withdraw the referral, it will be closed.',
    pageHeading: 'Withdrawal reason',
    radioLegend: 'Select the reason for this withdrawal',
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
        !referralStatusUpdateData.statusCategoryCode ||
        !referralStatusUpdateData.initialStatusDecision ||
        !content[referralStatusUpdateData.initialStatusDecision]
      ) {
        return res.redirect(paths.show.statusHistory({ referralId }))
      }

      const { decisionForCategoryAndReason, initialStatusDecision } = referralStatusUpdateData

      const [referral, statusHistory, reasons] = await Promise.all([
        this.referralService.getReferral(username, referralId),
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referenceDataService.getReferralStatusCodeReasons(
          username,
          referralStatusUpdateData.statusCategoryCode,
          decisionForCategoryAndReason,
          { deselectAndKeepOpen: referralStatusUpdateData.initialStatusDecision === 'DESELECTED|OPEN' },
        ),
      ])

      const person = await this.personService.getPerson(username, referral.prisonNumber)

      if (reasons.length === 0) {
        req.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          statusReasonCode: undefined,
        }

        if (referralStatusUpdateData.initialStatusDecision === 'DESELECTED|OPEN') {
          return res.redirect(`${assessPaths.updateStatus.decision.show({ referralId })}?deselectAndKeepOpen=true`)
        }

        return res.redirect(paths.updateStatus.selection.show({ referralId }))
      }

      const radioItems = ReferralUtils.statusOptionsToRadioItems(reasons, referralStatusUpdateData.statusReasonCode)

      FormUtils.setFieldErrors(req, res, ['reasonCode'])

      return res.render('referrals/updateStatus/reason/show', {
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
      const { reasonCode } = req.body
      const { referralStatusUpdateData } = req.session

      if (!referralStatusUpdateData?.statusCategoryCode) {
        return res.redirect(paths.updateStatus.category.show({ referralId }))
      }

      const { decisionForCategoryAndReason } = referralStatusUpdateData

      if (!reasonCode) {
        req.flash(
          'reasonCodeError',
          decisionForCategoryAndReason === 'DESELECTED' ? 'Select a deselection reason' : 'Select a withdrawal reason',
        )

        return res.redirect(paths.updateStatus.reason.show({ referralId }))
      }

      req.session.referralStatusUpdateData = {
        ...referralStatusUpdateData,
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
