import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { ReferralService } from '../../services'
import { FormUtils, ReferralUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

export default class UpdateStatusDecisionController {
  constructor(private readonly referralService: ReferralService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { token: userToken, username } = req.user
      const { referralStatusUpdateData } = req.session

      if (referralStatusUpdateData?.referralId !== referralId) {
        delete req.session.referralStatusUpdateData
      }

      const isDeselectAndKeepOpen = this.isDeselectAndKeepOpen(req)

      const [statusHistory, statusTransitionsForReferral, confirmationText] = await Promise.all([
        this.referralService.getReferralStatusHistory(userToken, username, referralId),
        this.referralService.getStatusTransitions(username, referralId, {
          deselectAndKeepOpen: isDeselectAndKeepOpen,
          ptUser: true,
        }),
        isDeselectAndKeepOpen
          ? this.referralService.getConfirmationText(username, referralId, 'DESELECTED', {
              deselectAndKeepOpen: true,
              ptUser: true,
            })
          : {
              primaryDescription: 'Record all decisions to keep the status up to date.',
              primaryHeading: 'Update referral status',
              secondaryDescription: null,
              secondaryHeading: 'Select decision',
            },
      ])

      const statusTransitions = statusTransitionsForReferral.map(statusTransition => {
        if (statusTransition.deselectAndKeepOpen) {
          return {
            ...statusTransition,
            code: `${statusTransition.code}|OPEN`,
          }
        }
        return statusTransition
      })

      const radioItems = ReferralUtils.statusOptionsToRadioItems(
        statusTransitions,
        isDeselectAndKeepOpen
          ? req.session.referralStatusUpdateData?.finalStatusDecision
          : req.session.referralStatusUpdateData?.initialStatusDecision,
      )

      FormUtils.setFieldErrors(req, res, ['statusDecision'])

      return res.render('referrals/updateStatus/decision/show', {
        backLinkHref: assessPaths.show.statusHistory({ referralId }),
        confirmationText,
        pageHeading: confirmationText.primaryHeading,
        radioItems,
        timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      const { statusDecision } = req.body as { statusDecision: Uppercase<string> }
      const { referralStatusUpdateData } = req.session

      if (!statusDecision) {
        req.flash('statusDecisionError', 'Select a status decision')

        return res.redirect(assessPaths.updateStatus.decision.show({ referralId }))
      }

      const splitStatusDecision = statusDecision.split('|')
      const statusDecisionValue = splitStatusDecision[0] as ReferralStatusUppercase

      req.session.referralStatusUpdateData = {
        decisionForCategoryAndReason: statusDecisionValue,
        initialStatusDecision: statusDecision,
        ...(this.isDeselectAndKeepOpen(req) ? referralStatusUpdateData : {}),
        finalStatusDecision: statusDecisionValue,
        referralId,
      }

      if (statusDecisionValue === 'DESELECTED' || statusDecisionValue === 'WITHDRAWN') {
        return res.redirect(assessPaths.updateStatus.category.show({ referralId }))
      }

      return res.redirect(assessPaths.updateStatus.selection.show({ referralId }))
    }
  }

  private isDeselectAndKeepOpen(req: Request) {
    return (
      req.query.deselectAndKeepOpen === 'true' &&
      req.session.referralStatusUpdateData?.initialStatusDecision === 'DESELECTED|OPEN'
    )
  }
}
